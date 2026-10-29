(() => {
  // Ground placement is independent of the animation pose. Only a small cached
  // set of sole points is evaluated after the pose has been applied.
  window.createFootContact = function createFootContact(THREE) {
    const meshSamples = new WeakMap();
    const creatureSamples = new WeakMap();
    const point = new THREE.Vector3();
    const rootInverse = new THREE.Matrix4();
    const relativeMatrix = new THREE.Matrix4();
    const soleOffsets = [
      new THREE.Vector3(0, -.515, -.10),
      new THREE.Vector3(0, -.515, .30)
    ];
    const height = 2.32;
    const component = (attribute, index, slot) => slot === 0 ? attribute.getX(index)
      : slot === 1 ? attribute.getY(index) : slot === 2 ? attribute.getZ(index) : attribute.getW(index);

    function visibleMeshes(root, visit) {
      if (!root || root.visible === false) return;
      if (root.isMesh) visit(root);
      for (const child of root.children || []) visibleMeshes(child, visit);
    }

    function cacheSkinSamples(mesh) {
      const geometry = mesh.geometry;
      const old = meshSamples.get(mesh);
      if (old && old.geometry === geometry) return old.indices;
      const position = geometry?.getAttribute('position');
      const skinIndex = geometry?.getAttribute('skinIndex');
      const skinWeight = geometry?.getAttribute('skinWeight');
      const bones = mesh.skeleton?.bones || [];
      const indices = [];
      const record = { geometry, indices };
      meshSamples.set(mesh, record);
      if (!position || !skinIndex || !skinWeight || !bones.length) return indices;

      // Split helmet meshes can share the complete body position buffer. Inspect
      // only vertices referenced by this mesh's triangles, never the hidden copy.
      const used = geometry.index ? new Uint8Array(position.count) : null;
      if (used) {
        const drawStart = geometry.drawRange?.start || 0;
        const drawEnd = Math.min(geometry.index.count, drawStart + (geometry.drawRange?.count ?? Infinity));
        for (let i = drawStart; i < drawEnd; i++) used[geometry.index.getX(i)] = 1;
      }
      const contactBones = bones.map(bone => /shin|knee|ankle|foot/i.test(bone.name || ''));
      const anklePoints = [null, null];
      const inverseBind = new THREE.Matrix4().copy(mesh.bindMatrix).invert();
      bones.forEach((bone, index) => {
        if (!/shin|ankle/i.test(bone.name || '') || !mesh.skeleton.boneInverses[index]) return;
        const bindPoint = new THREE.Vector3().setFromMatrixPosition(
          new THREE.Matrix4().copy(mesh.skeleton.boneInverses[index]).invert()
        ).applyMatrix4(inverseBind);
        anklePoints[bindPoint.x < 0 ? 0 : 1] = bindPoint;
      });
      const candidates = [[], []];
      for (let i = 0; i < position.count; i++) {
        if (used && !used[i]) continue;
        const y = position.getY(i);
        if (!Number.isFinite(y) || y > height * .2 || y < -height * .08) continue;
        let influence = 0;
        for (let slot = 0; slot < 4; slot++) {
          if (contactBones[component(skinIndex, i, slot)]) influence += component(skinWeight, i, slot);
        }
        if (influence < .5) continue;
        const x = position.getX(i), z = position.getZ(i), side = x < 0 ? 0 : 1;
        const ankle = anklePoints[side];
        // A long cape or tail may also extend below the knees. Keep the samples
        // close to the ankle and toward the toe, excluding those trailing panels.
        if (ankle && (Math.abs(x - ankle.x) > height * .13 || z < ankle.z - height * .06 || z > ankle.z + height * .23)) continue;
        candidates[side].push({ index: i, x, y, z });
      }
      for (const sideCandidates of candidates) {
        if (!sideCandidates.length) continue;
        let low = Infinity;
        for (const candidate of sideCandidates) low = Math.min(low, candidate.y);
        const sole = sideCandidates.filter(candidate => candidate.y <= low + height * .025);
        let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
        for (const candidate of sole) {
          minX = Math.min(minX, candidate.x); maxX = Math.max(maxX, candidate.x);
          minZ = Math.min(minZ, candidate.z); maxZ = Math.max(maxZ, candidate.z);
        }
        // Two strips across the sole and four from heel to toe: at most eight
        // vertices per foot, regardless of the original mesh's polygon count.
        const bins = Array(8).fill(null);
        for (const candidate of sole) {
          const column = candidate.x > (minX + maxX) * .5 ? 1 : 0;
          const row = Math.min(3, Math.floor(4 * (candidate.z - minZ) / Math.max(.0001, maxZ - minZ)));
          const slot = row * 2 + column;
          if (!bins[slot] || candidate.y < bins[slot].y) bins[slot] = candidate;
        }
        for (const sample of bins) if (sample) indices.push(sample.index);
      }
      return indices;
    }

    function cacheCreatureSamples(model) {
      let samples = creatureSamples.get(model);
      if (samples) return samples;
      // Work in model coordinates so later rotations and bobbing do not corrupt
      // the original sole height. This bounds pass happens only at first load.
      const bounds = new THREE.Box3();
      rootInverse.copy(model.matrixWorld).invert();
      visibleMeshes(model, mesh => {
        if (!mesh.geometry?.getAttribute('position')) return;
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        relativeMatrix.multiplyMatrices(rootInverse, mesh.matrixWorld);
        bounds.union(mesh.geometry.boundingBox.clone().applyMatrix4(relativeMatrix));
      });
      samples = [];
      if (!bounds.isEmpty()) {
        const cx = (bounds.min.x + bounds.max.x) * .5;
        const cz = (bounds.min.z + bounds.max.z) * .5;
        const halfWidth = (bounds.max.x - bounds.min.x) * .16;
        const halfDepth = (bounds.max.z - bounds.min.z) * .14;
        samples.push(new THREE.Vector3(cx, bounds.min.y, cz));
        for (const side of [-1, 1]) for (const end of [-1, 1]) {
          samples.push(new THREE.Vector3(cx + side * halfWidth, bounds.min.y, cz + end * halfDepth));
        }
      }
      creatureSamples.set(model, samples);
      return samples;
    }

    function place(rig, groundPoint, airLift = 0) {
      if (!rig || !groundPoint) return 0;
      const ud = rig.userData || {};
      if (ud.groundShadow) ud.groundShadow.visible = false;
      rig.position.x = groundPoint.x;
      rig.position.z = groundPoint.z;
      rig.updateMatrixWorld(true);
      let lowest = Infinity;
      const include = sample => { if (Number.isFinite(sample.y)) lowest = Math.min(lowest, sample.y); };

      if (ud.ecal) {
        // Ecal's supplied artwork has its feet at the visual root origin.
        point.set(0, 0, 0).applyMatrix4(rig.matrixWorld); include(point);
      } else {
        const model = ud.helmetedModel?.visible ? ud.helmetedModel
          : ud.glbModel?.visible ? ud.glbModel : null;
        if (model) {
          visibleMeshes(model, mesh => {
            if (!mesh.isSkinnedMesh) return;
            // Sample this frame’s skeleton, not last render’s bone matrices.
            mesh.skeleton.update();
            for (const index of cacheSkinSamples(mesh)) {
              if (typeof mesh.getVertexPosition === 'function') mesh.getVertexPosition(index, point);
              else {
                point.fromBufferAttribute(mesh.geometry.getAttribute('position'), index);
                if (typeof mesh.applyBoneTransform === 'function') mesh.applyBoneTransform(index, point);
                else if (typeof mesh.boneTransform === 'function') mesh.boneTransform(index, point);
              }
              point.applyMatrix4(mesh.matrixWorld); include(point);
            }
          });
        } else if (ud.creatureModel?.visible) {
          for (const sample of cacheCreatureSamples(ud.creatureModel)) {
            point.copy(sample).applyMatrix4(ud.creatureModel.matrixWorld); include(point);
          }
        } else if (ud.body?.visible !== false) {
          for (const leg of ud.legs || []) {
            const shin = leg.userData?.shin;
            if (!shin) continue;
            for (const offset of soleOffsets) {
              point.copy(offset).applyMatrix4(shin.matrixWorld); include(point);
            }
          }
        }
      }
      // Imported rigs are fitted to a zero-height sole while loading, and this
      // also keeps an unsupported mesh grounded without a costly bounds scan.
      if (!Number.isFinite(lowest)) {
        point.set(0, 0, 0).applyMatrix4(rig.matrixWorld); lowest = point.y;
      }
      const target = (Number.isFinite(groundPoint.y) ? groundPoint.y : 0) + (Number.isFinite(airLift) ? airLift : 0);
      const desiredOffset=rig.position.y-lowest,now=performance.now()/1000;
      const previous=ud.solePlacement,dt=previous?Math.max(0,now-previous.time):1;
      const p=ud.source||{},idle=!(p.moveSpeed>1)&&!(p.actionTime>0)&&!p.jump&&!p.villageAirborne&&!p.flying&&!p.climbing&&!p.dodge&&!p.knockdown&&!p.finStunt&&!p.ecalSkill;
      const scale=rig.scale.y,modelKey=ud.helmetedModel?.visible?'helmet':'body';
      let offset=desiredOffset;
      if(previous&&dt<.25&&previous.scale===scale&&previous.modelKey===modelKey){
        // Hold the standing sole height; animation must not shake the entire body.
        offset=idle&&previous.idle?previous.offset:previous.offset+(desiredOffset-previous.offset)*(1-Math.exp(-dt*10));
      }
      ud.solePlacement={offset,time:now,idle,scale,modelKey};
      const correction=target+offset-rig.position.y;
      rig.position.y=target+offset;
      rig.updateMatrixWorld(true);
      return correction;
    }
    return { place };
  };
})();

/* The coastal truth is complete before the ship becomes available to board. */
(()=>{
 window.homeClues=window.homeClues.slice(0,3);
 window.VillageClueScene={duration:106,
  photosFound(study){return Array.isArray(study?.found)&&study.found.slice(0,3).length===3&&study.found.slice(0,3).every(Boolean);},
  readyForTruth(study){return Array.isArray(study?.found)&&study.found.length>=3&&study.found.slice(0,3).every(Boolean);},
  begin(s,p){if(s?.round!==3||!p||!this.readyForTruth(s.homeStudy)||s.clueScene)return false;s.clueScene={id:Date.now(),heroId:p.id,age:0,crew:Object.keys(s.players),ready:{}};for(const hero of Object.values(s.players)){hero.heldPhoto=null;hero.inspectingPhoto=false;hero.fx=hero.fy=hero.moveSpeed=hero.walkX=hero.walkY=0;hero.action='';hero.actionTime=0;}return true;},
  finish(s){if(!s.clueScene)return;const landed=s.clueScene.age>=70;s.clueScene=null;if(s.homeStudy){s.homeStudy.cinematicSeen=true;s.homeStudy.transportLanded=landed;s.homeStudy.message='The truth is revealed. The heroes are gathering at the transport. Board the ship when you are ready.';}},
  step(s,dt,ready){const c=s.clueScene;if(!c||!ready||document.hidden||c.crew.some(id=>s.players[id]&&!c.ready[id]))return;c.age=Math.min(this.duration,c.age+Math.min(.05,Math.max(0,Number.isFinite(dt)?dt:0)));if(c.age>=this.duration)this.finish(s);}
 };
})();

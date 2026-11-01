/* The user's failure song plays once on failure; victory stays silent. */
(() => {
  const results=document.querySelector('#results'),title=document.querySelector('#resultTitle');if(!results||!title)return;
  const song=document.createElement('audio');song.id='missionFailedMusic';song.src='assets/mission-failed.m4a';song.preload='metadata';song.volume=.6;document.body.appendChild(song);
  const button=document.createElement('button');button.type='button';button.className='btn btn-outline';button.textContent='▶ PLAY FAILURE MUSIC';button.hidden=true;results.appendChild(button);
  const isFailure=()=>results.classList.contains('active')&&/FAILED|OVERWHELMED|DEFEAT|GAME OVER/i.test(title.textContent);
  let active=false,attempt=0;
  function stop(){attempt++;song.pause();song.currentTime=0;button.hidden=true;}
  function play(){
    if(!isFailure())return;
    document.querySelectorAll('#selectionMusic,#riseUpMusic,#levelOneMusic').forEach(track=>track.pause());
    const token=++attempt;button.hidden=true;
    song.play().then(()=>{if(token!==attempt||!isFailure())song.pause();}).catch(()=>{if(token===attempt&&isFailure())button.hidden=false;});
  }
  function sync(){const next=isFailure();if(next&&!active){active=true;play();}else if(!next&&active){active=false;stop();}}
  button.addEventListener('click',play);
  song.addEventListener('play',()=>{if(!isFailure())stop();});
  new MutationObserver(sync).observe(results,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});
  window.addEventListener('pagehide',stop);sync();
})();

/* Results screens are silent, including late browser playback promises. */
(() => {
  const results=document.querySelector('#results');
  if(!results)return;
  const tracks=()=>[...document.querySelectorAll('#selectionMusic, #riseUpMusic, #levelOneMusic')];
  const finished=()=>results.classList.contains('active');
  function stop(track){track.pause();try{track.currentTime=0;}catch{}}
  function stopResultsMusic(){if(finished())tracks().forEach(stop);}
  new MutationObserver(stopResultsMusic).observe(results,{attributes:true,attributeFilter:['class']});
  // A queued play() can finish after the results screen has opened.
  document.addEventListener('play',event=>{if(finished()&&tracks().includes(event.target))stop(event.target);},true);
  stopResultsMusic();
})();

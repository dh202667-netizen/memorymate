async (page) => {
 const routes = [{"id":"welcome","path":"pages/welcome/index","title":"忆伴","mode":"public"},{"id":"login","path":"pages/auth/login","title":"欢迎回家","mode":"public"},{"id":"register","path":"pages/auth/register","title":"注册体验家庭","mode":"public"},{"id":"role","path":"pages/auth/role","title":"选择使用方式","mode":"public"},{"id":"elderHome","path":"pages/elder/home","title":"首页","mode":"elder"},{"id":"memory","path":"pages/memory/index","title":"记忆家园","mode":"elder"},{"id":"people","path":"pages/memory/people","title":"我的家人","mode":"shared"},{"id":"person","path":"pages/memory/person","title":"人物详情","mode":"shared"},{"id":"stories","path":"pages/memory/stories","title":"家庭故事","mode":"shared"},{"id":"story","path":"pages/memory/story","title":"故事详情","mode":"shared"},{"id":"relations","path":"pages/memory/relations","title":"我们的家庭","mode":"shared"},{"id":"timeline","path":"pages/memory/timeline","title":"记忆时间轴","mode":"shared"},{"id":"album","path":"pages/memory/album","title":"家庭相册","mode":"shared"},{"id":"training","path":"pages/training/index","title":"动动脑","mode":"elder"},{"id":"trainingDetail","path":"pages/training/detail","title":"活动详情","mode":"elder"},{"id":"trainingPlay","path":"pages/training/play","title":"认知小活动","mode":"elder"},{"id":"trainingResult","path":"pages/training/result","title":"本次活动","mode":"elder"},{"id":"trainingHistory","path":"pages/training/history","title":"活动历史","mode":"elder"},{"id":"companion","path":"pages/companion/index","title":"AI陪伴","mode":"elder"},{"id":"health","path":"pages/health/index","title":"今日健康任务","mode":"shared"},{"id":"familyHome","path":"pages/family/home","title":"家庭首页","mode":"family"},{"id":"manageMemory","path":"pages/family/memory","title":"记忆管理","mode":"family"},{"id":"personEdit","path":"pages/family/person-edit","title":"添加或编辑家人","mode":"family"},{"id":"storyEdit","path":"pages/family/story-edit","title":"写一个家庭故事","mode":"family"},{"id":"mediaAdd","path":"pages/family/media-add","title":"添加照片与声音","mode":"family"},{"id":"observation","path":"pages/family/observation","title":"健康观察","mode":"family"},{"id":"observationAdd","path":"pages/family/observation-add","title":"记录日常观察","mode":"family"},{"id":"interaction","path":"pages/family/interaction","title":"家庭互动","mode":"family"},{"id":"messageAdd","path":"pages/family/message-add","title":"给家人留句话","mode":"family"},{"id":"dates","path":"pages/family/dates","title":"重要的日子","mode":"family"},{"id":"account","path":"pages/account/index","title":"我的","mode":"shared"},{"id":"profile","path":"pages/account/profile","title":"个人资料","mode":"shared"},{"id":"accessibility","path":"pages/account/accessibility","title":"字体与语音","mode":"shared"},{"id":"binding","path":"pages/account/binding","title":"家庭成员绑定","mode":"shared"},{"id":"notifications","path":"pages/account/notifications","title":"消息设置","mode":"shared"},{"id":"privacy","path":"pages/account/privacy","title":"隐私与授权","mode":"public"},{"id":"settings","path":"pages/account/settings","title":"APP设置","mode":"shared"},{"id":"messages","path":"pages/messages/index","title":"家人的消息","mode":"shared"}];
 const results=[], failures=[], errors=[];
 page.on('pageerror', e=>errors.push(e.message));
 page.on('console', m=>{if(m.type()==='error')errors.push(m.text())});
 for(const scenario of [{width:390,font:'standard'},{width:360,font:'extra'},{width:412,font:'extra'}]) {
  await page.setViewportSize({width:scenario.width,height:844});
  for(const route of routes) {
   await page.evaluate(({mode,font})=>{localStorage.setItem('memorymate.v1.mode',mode);localStorage.setItem('memorymate.v1.fontSize',font)}, {mode:route.mode==='family'?'family':'elder',font:scenario.font});
   const params=route.id==='person'?'?id=p1':route.id==='story'?'?id=s2':['trainingDetail','trainingPlay'].includes(route.id)?'?type=attention':'';
   await page.goto('http://127.0.0.1:5173/?ui='+route.id+'-'+scenario.width+'#/'+route.path+params);
   await page.locator('.app-layout').waitFor();
   await page.waitForFunction(t=>document.title===t,route.title);
   await page.waitForFunction(()=>document.querySelector('.page-content')?.textContent?.trim().length>10);
   const findings=await page.evaluate(()=>{
    const app=document.querySelector('.app-layout');
    const findings=[];
    if(app.scrollWidth>app.clientWidth+1) findings.push({kind:'overflow',width:app.scrollWidth,available:app.clientWidth});
    const rgb=c=>c.match(/[\d.]+/g)?.map(Number)??[255,255,255,1];
    const lum=c=>c.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
    const background=el=>{const layers=[];for(let e=el;e;e=e.parentElement)layers.unshift(rgb(getComputedStyle(e).backgroundColor));return layers.reduce((under,over)=>{const a=over[3]??1;return over.slice(0,3).map((v,i)=>v*a+under[i]*(1-a))},[255,255,255]);};
    for(const el of app.querySelectorAll('*')) {
     const s=getComputedStyle(el); if(s.display==='none'||s.visibility==='hidden'||!el.getClientRects().length||el.closest('[aria-hidden="true"]')) continue;
     const text=Array.from(el.childNodes).filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').trim();
     if(text) {
      if(parseFloat(s.fontSize)<15.99) findings.push({kind:'font',text:text.slice(0,35),size:s.fontSize});
      const a=lum(rgb(s.color)),b=lum(background(el)),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
      if(ratio<4.5 && !el.closest('[disabled]')) findings.push({kind:'contrast',text:text.slice(0,35),ratio:Math.round(ratio*100)/100,color:s.color});
     }
     if(el.matches('[role="button"],[role="switch"]')) {const r=el.getBoundingClientRect();if(r.height<47.9) findings.push({kind:'target',text:el.textContent.trim().slice(0,35),height:r.height});}
    }
    return findings;
   });
   if(findings.length) failures.push({id:route.id,...scenario,findings});
   results.push({id:route.id,...scenario});
   if(scenario.width===390&&['elderHome','familyHome','memory','training','companion','manageMemory','observation','stories'].includes(route.id)) await page.screenshot({path:'output/ui-refresh/'+route.id+'.png',fullPage:true});
  }
 }
 return {checks:results.length,failures,errors};
}


async (page) => {
  const results = []
  const root = 'http://127.0.0.1:5173/#/pages/'
  const click = name => page.getByRole('button', { name, exact: true }).click()
  await page.goto(root + 'auth/role')
  await click('我是家属 留下家庭回忆 关心家人的每一天')
  await page.goto(root + 'memory/stories')
  for (const [title, file] of [
    ['还记得，那年的全家福吗？', 'family-photo-v3.png'],
    ['小红的第一次钢琴比赛', 'story-piano.png'],
    ['一家人的秋日旅行', 'story-autumn.png'],
  ]) {
    const card = page.locator('.story-card').filter({ hasText: title })
    await card.waitFor()
    const src = await card.locator('.cover img').getAttribute('src')
    if (!src.endsWith(file)) throw new Error('Wrong story cover: ' + title + ' ' + src)
    await card.click()
    await page.locator('.story-cover').waitFor()
    if (!(await page.locator('.story-cover img').getAttribute('src')).endsWith(file)) throw new Error('Detail cover mismatch')
    await page.goto(root + 'memory/stories')
  }
  results.push('three distinct story covers match their details')
  const original = await page.evaluate(() => localStorage.getItem('memorymate.v1.database.v2'))
  try {
    await page.evaluate(() => {
      const stored = JSON.parse(localStorage.getItem('memorymate.v1.database.v2'))
      const db = stored.data ?? stored
      db.stories.forEach(s => { if (['s1','s2','s3'].includes(s.id)) s.cover = '/static/images/family-photo.png' })
      db.media.filter(m=>m.type==='photo' && m.storyId==='s3').forEach(m=>m.src='/static/images/family-photo.png')
      db.stories.push({id:'uploaded-test',title:'保留上传照片',date:'2026-11-17',description:'Fixture',personIds:[],cover:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20"%3E%3Crect width="20" height="20" fill="green"/%3E%3C/svg%3E'})
      localStorage.setItem('memorymate.v1.database.v2',JSON.stringify(stored))
    })
    await page.reload()
    const piano = page.locator('.story-card').filter({hasText:'小红的第一次钢琴比赛'})
    await piano.waitFor()
    if (!(await piano.locator('.cover img').getAttribute('src')).endsWith('story-piano.png')) throw new Error('Legacy cover not upgraded')
    const uploaded = page.locator('.story-card').filter({hasText:'保留上传照片'})
    if (!(await uploaded.locator('.cover img').getAttribute('src')).startsWith('data:image/svg+xml')) throw new Error('Uploaded cover overwritten')
    await page.goto(root + 'memory/album')
    await page.getByRole('button',{name:'查看大图：与家人一起的好时光',exact:true}).waitFor()
    const autumn = page.getByRole('button',{name:'查看大图：与家人一起的好时光',exact:true})
    if (!(await autumn.locator('img').getAttribute('src')).endsWith('story-autumn.png')) throw new Error('Linked album mismatch')
    results.push('legacy covers upgraded and uploaded photo preserved')
  } finally {
    await page.evaluate(value => localStorage.setItem('memorymate.v1.database.v2',value), original)
  }
  await page.goto(root + 'auth/role')
  await click('我是长辈 看看家人，动动脑 和忆伴说说话')
  await page.goto(root + 'health/index')
  await click('10分钟')
  await page.waitForFunction(()=>document.querySelector('input[aria-label="本次散步时长（分钟）"]')?.value === '10')
  await click('记录今日散步')
  const toast = page.getByRole('status')
  await toast.waitFor()
  await page.waitForTimeout(4200)
  if (!(await toast.isVisible())) throw new Error('Feedback disappeared too early')
  await page.getByRole('button',{name:'关闭提示',exact:true}).click()
  await toast.waitFor({state:'hidden'})
  results.push('walking preset and extended dismissible feedback')
  await page.goto(root + 'auth/role')
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true})
  const target = page.getByRole('button',{name:'我是长辈 看看家人，动动脑 和忆伴说说话',exact:true})
  const box = await target.boundingBox()
  const x=box.x+box.width/2,y=box.y+box.height/2
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]})
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+35,y:y+35}]})
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
  await page.waitForTimeout(200)
  if(await page.title()!=='选择使用方式') throw new Error('Drag triggered a choice')
  await page.waitForTimeout(750)
  const tapBox = await target.boundingBox()
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:tapBox.x+tapBox.width/2,y:tapBox.y+tapBox.height/2}]})
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
  await page.waitForFunction(()=>document.title==='首页')
  await cdp.detach()
  results.push('touch drag does not activate a role and following tap works')
  return {module:'ui-interactions',passed:results}
}



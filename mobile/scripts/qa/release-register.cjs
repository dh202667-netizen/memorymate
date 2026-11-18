async (page) => {
  const origin = new URL(page.url()).origin
  await page.goto(origin + '/#/', {waitUntil:'domcontentloaded'})
  await page.getByRole('button', {name:'注册体验家庭',exact:true}).click()
  await page.getByRole('textbox',{name:'长辈姓名',exact:true}).waitFor()
  await page.getByRole('button',{name:'创建本地家庭，选择身份',exact:true}).click()
  await page.getByRole('status').filter({hasText:'姓名'}).waitFor()
  await page.getByRole('textbox',{name:'长辈姓名',exact:true}).fill('演示长辈')
  await page.getByRole('textbox',{name:'家庭名称',exact:true}).fill('MemoryMate 体验家庭')
  await page.getByRole('button',{name:'创建本地家庭，选择身份',exact:true}).click()
  await page.getByRole('button',{name:'我是长辈 看看家人，动动脑 和忆伴说说话',exact:true}).click()
  await page.locator('.greeting-title').filter({hasText:'演示长辈'}).waitFor()
  await page.reload({waitUntil:'domcontentloaded'})
  await page.locator('.greeting-title').filter({hasText:'演示长辈'}).waitFor()
  return {passed:['welcome registration entry','empty name validation','local registration and role selection','profile survives reload'],origin}
}

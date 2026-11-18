async (page) => {
  const results = []
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  const root = 'http://127.0.0.1:5173/#/pages/'
  const click = (name) => page.getByRole('button', { name, exact: true }).click()
  const role = async (name) => {
    await page.goto(root + 'auth/role')
    await page.reload()
    await click(
      name === 'elder'
        ? '我是长辈 看看家人，动动脑 和忆伴说说话'
        : '我是家属 留下家庭回忆 关心家人的每一天',
    )
  }
  await role('elder')
  await page.getByRole('navigation').getByRole('button', { name: 'AI陪伴', exact: true }).click()
  await click('清空聊天')
  await page.getByText('确认', { exact: true }).click()
  await page.getByRole('textbox', { name: '想和忆伴说的话' }).fill('今天散步很开心。')
  await click('发送')
  await page.locator('.assistant .chat-text').filter({ hasText: '选择熟悉的路线' }).last().waitFor()
  results.push('mock conversation response')
  await page.getByRole('textbox', { name: '想和忆伴说的话' }).fill('你能诊断阿尔茨海默病吗？')
  await click('发送')
  await page.locator('.assistant .chat-text').filter({ hasText: '不能判断疾病' }).waitFor()
  await page.reload()
  await page.locator('.assistant .chat-text').filter({ hasText: '不能判断疾病' }).waitFor()
  results.push('chat persistence and diagnostic boundary')
  await click('语音输入演示')
  await page.getByRole('status').filter({ hasText: '正在听（模拟）' }).waitFor()
  await click('完成模拟输入')
  await page.waitForFunction(() => document.querySelector('textarea')?.value?.includes('春节'))
  await click('发送')
  await page.locator('.assistant .chat-text').filter({ hasText: '我们一起想想' }).last().waitFor()
  results.push('simulated voice input and family story response')
  await page.context().setOffline(true)
  try {
    await page.getByRole('textbox', { name: '想和忆伴说的话' }).fill('您好')
    await click('发送')
    await page.locator('.assistant .chat-text').filter({ hasText: '开心的小事' }).last().waitFor()
  } finally {
    await page.context().setOffline(false)
  }
  results.push('offline mock conversation')
  await page.goto(root + 'health/index')
  await page.getByRole('spinbutton', { name: '本次散步时长（分钟）' }).fill('25')
  await click('记录今日散步')
  await page.getByText('记录散步 25 分钟', { exact: false }).waitFor()
  await page.reload()
  await page.getByText('记录散步 25 分钟', { exact: false }).waitFor()
  await page
    .locator('.card')
    .filter({ hasText: '出去走一走' })
    .getByRole('button', { name: '撤销今天这次记录' })
    .click()
  await page.getByRole('spinbutton', { name: '本次散步时长（分钟）' }).waitFor()
  await page.getByRole('spinbutton', { name: '本次散步时长（分钟）' }).fill('15')
  await click('记录今日散步')
  await click('记录一次家庭交流')
  results.push('health task record, undo and persistence')
  await role('family')
  await page.getByRole('navigation').getByRole('button', { name: '健康观察', exact: true }).click()
  await page.getByText('记录散步 15 分钟', { exact: false }).waitFor()
  await click('新增观察')
  await click('保存观察')
  await page.getByRole('status').filter({ hasText: '请填写观察内容' }).waitFor()
  await page
    .getByRole('textbox', { name: '观察内容' })
    .fill('今天主动聊起全家福，愿意分享公园散步的趣事。')
  await click('保存观察')
  await page.getByText('今天主动聊起全家福，愿意分享公园散步的趣事。', { exact: true }).waitFor()
  await click('近4周')
  await page
    .locator('.bar-column')
    .count()
    .then((n) => {
      if (n !== 4) throw new Error('four week view failed')
    })
  results.push('family observation form, actual activity and period switch')
  await role('elder')
  await page.goto(root + 'account/privacy')
  await page.getByRole('switch').filter({ hasText: '向家属分享日常活动' }).click()
  await role('family')
  await page.getByRole('navigation').getByRole('button', { name: '健康观察', exact: true }).click()
  await page.getByText('日常活动分享已暂停', { exact: true }).waitFor()
  if (await page.getByText('今天主动聊起全家福，愿意分享公园散步的趣事。', { exact: true }).count())
    throw new Error('private observation visible')
  results.push('sharing preference hides family activity')
  await role('elder')
  await page.goto(root + 'account/privacy')
  await page.getByRole('switch').filter({ hasText: '向家属分享日常活动' }).click()
  if (errors.length) throw new Error(errors.join(';'))
  return { module: 'daily', passed: results, errors }
}

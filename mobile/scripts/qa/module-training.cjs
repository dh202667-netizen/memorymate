async (page) => {
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  const results = []
  const root = 'http://127.0.0.1:5173/#/pages/'
  const click = (name) => page.getByRole('button', { name, exact: true }).click()
  await page.goto(root + 'auth/role')
  await page.reload()
  await click('我是长辈 看看家人，动动脑 和忆伴说说话')
  await page.getByRole('navigation').getByRole('button', { name: '动动脑', exact: true }).click()
  for (const [type, title, answers] of [
    ['memory', '记忆力', [1, 2, 1]],
    ['attention', '注意力', [2, 1, 1]],
    ['language', '语言能力', [0, 1, 0]],
    ['executive', '执行能力', [0, 1, 0]],
    ['spatial', '视觉空间', [1, 1, 2]],
  ]) {
    await page
      .getByRole('button')
      .filter({ hasText: title })
      .filter({ hasText: '3 道小题' })
      .click()
    await click('开始活动')
    await page.locator('.progress-track').waitFor()
    for (let i = 0; i < 3; i++) {
      if (await page.getByRole('button', { name: '我看好了，开始回想', exact: true }).count())
        await click('我看好了，开始回想')
      if (!(await page.getByRole('button', { name: '确认答案', exact: true }).isDisabled()))
        throw new Error('unanswered submission enabled')
      const options = page.locator('.answer-option')
      const answer = type === 'language' && i === 0 ? 1 : answers[i]
      await options.nth(answer).click()
      await click('确认答案')
      await click(i === 2 ? '查看本次结果' : '下一题')
    }
    await page.waitForFunction(() => document.title === '本次活动')
    const expected = type === 'language' ? 2 : 3
    await page.getByText(expected + ' / 3 题答对', { exact: false }).waitFor()
    await click('查看活动历史')
    await page.getByRole('button').filter({ hasText: title }).first().waitFor()
    await page.reload()
    await page.getByRole('button').filter({ hasText: title }).first().waitFor()
    results.push(type + ' quiz, review and persisted history')
    await page.goto(root + 'training/index')
  }
  await page
    .getByRole('button')
    .filter({ hasText: '注意力' })
    .filter({ hasText: '3 道小题' })
    .click()
  await click('开始活动')
  await click('先休息')
  await page.getByText('确认', { exact: true }).click()
  await page.waitForFunction(() => document.title === '动动脑')
  results.push('unfinished activity exit')
  if (errors.length) throw new Error(errors.join(';'))
  return { module: 'training', passed: results, errors }
}

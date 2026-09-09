// Isolated browser contexts only: never modifies the user's normal browser data.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/Users/skyris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.QA_URL || 'http://127.0.0.1:5173/compliance-training-agent/';
const output = process.env.QA_OUTPUT || '/tmp/training-room-privacy-qa';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const ids = ['dp-1','dp-2','dp-3','is-1','is-2','is-3'];
const manifest = {
  finance: ['salary-screen','expense-documents','tax-drawer'], research: ['password-note','whiteboard-photo','unmanaged-usb'],
  hr: ['exposed-resumes','health-group-message','stale-offboarding-account'], reception: ['open-visitor-register','shipping-label','visitor-tailgating'],
  legal: ['contract-comments','third-party-overshare','unchecked-cross-border'], executive: ['printer-minutes','undisclosed-recording','unapproved-ai'],
};
const progress = page => page.evaluate(() => JSON.parse(localStorage.getItem('compliance_training_progress') || '{}')['data-privacy']);
const frameOf = async page => { await page.locator('iframe').waitFor(); const frame = page.frameLocator('iframe'); await frame.locator('body').waitFor(); return frame; };
async function enterOffice(frame, office) {
  if (await frame.getByRole('button',{name:'进入公司',exact:false}).isVisible()) await frame.getByRole('button',{name:'进入公司',exact:false}).click();
  await frame.locator(`button[data-office-id="${office}"]`).click();
  await frame.locator(`.office-room-scene[data-office-id="${office}"]`).waitFor();
}
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, hasTouch: width === 390 });
    const page = await context.newPage(); page.setDefaultTimeout(12000);
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    try {
      await page.goto(`${base}#/course/data-privacy/quiz`);
      await page.waitForURL('**/lesson/dp-1');
      assert.equal((await progress(page))?.passed || false,false);
      await page.goto(`${base}#/course/data-privacy/lesson/is-3`);
      await page.waitForURL('**/lesson/dp-1');
      for (let i=0;i<6;i++) {
        await page.getByRole('button',{name:i===5?'文字已学完，进入互动微课':'已读完，下一课',exact:true}).click();
      }
      let frame = await frameOf(page);
      await page.getByText('正在载入微课并恢复学习进度…').waitFor({state:'hidden'});
      assert.equal((await progress(page)).progress,50);
      await page.screenshot({ path: `${output}/${width}-entry.png`, fullPage:true });
      console.log(`${width}: reading, skip guards, iframe entry passed`);
      await enterOffice(frame,'finance');
      for (const [index,[office,hazards]] of Object.entries(manifest).entries()) {
        await frame.locator(`.office-room-scene[data-office-id="${office}"]`).waitFor();
        for (const hazard of hazards) {
          await frame.locator(`button.room-hazard-hotspot[data-hazard-id="${hazard}"]`).click();
          await frame.locator('.insight-dialog').waitFor();
          await frame.locator('button.insight-dialog__close').click();
        }
        await frame.locator('.completion-dialog').waitFor();
        await frame.locator('.checkpoint-option').filter({has:frame.locator('[data-checkpoint-option="0"]')}).click();
        assert.equal(await frame.locator('.checkpoint-feedback').getAttribute('data-state'),'wrong');
        assert.equal((await progress(page)).passed,false);
        assert.equal(await frame.locator('[data-completion-floor]').last().isDisabled(),true);
        if (index === 0) {
          await page.reload(); frame = await frameOf(page);
          // Original standalone startup restores exploration but returns to the building.
          await enterOffice(frame,'finance');
          await frame.locator('[data-resume-checkpoint]').click();
        }
        await frame.locator('.checkpoint-option').filter({has:frame.locator('[data-checkpoint-option="1"]')}).click();
        await page.waitForFunction(count=>JSON.parse(localStorage.getItem('compliance_training_progress'))['data-privacy'].privacy_learning.microcourse.passedCheckpoints.length===count,index+1);
        assert.equal(await frame.locator('.checkpoint-feedback').getAttribute('data-state'),'correct');
        await page.screenshot({path:`${output}/${width}-${office}.png`,fullPage:true});
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        assert.equal(await frame.locator('html').evaluate(el=>el.scrollWidth>window.innerWidth),false);
        console.log(`${width}: ${office} exploration + wrong answer + correct answer passed`);
        if (index<5) await frame.locator('[data-next-office]').click();
      }
      assert.equal((await progress(page)).progress,100); assert.equal((await progress(page)).passed,true);
      await page.getByText('文字与互动微课均已完成，进度已保存。可继续重温。').waitFor();
      await page.reload(); await frameOf(page);
      await page.getByText('文字与互动微课均已完成，进度已保存。可继续重温。').waitFor();
      await page.getByRole('button',{name:'课程目录',exact:true}).click();
      await page.getByText('已通过',{exact:true}).waitFor();
      assert.equal(await page.getByRole('button',{name:'重新测验',exact:true}).count(),0);
      await page.getByRole('button',{name:'返回首页',exact:true}).click();
      await page.locator('.training-dashboard').waitFor();
      assert.deepEqual(errors,[]);
      console.log(`${width}: completion, reload, course directory, dashboard and overflow passed`);
    } catch (error) {
      await page.screenshot({path:`${output}/${width}-failure.png`,fullPage:true});
      console.error('Page:',page.url(),await page.locator('body').innerText());
      console.error('Frame:',await page.frameLocator('iframe').locator('body').innerText().catch(()=>''));
      throw error;
    } finally { await context.close(); }
  }
} finally { await browser.close(); }

import { playbook, reliefPlan } from '../engine/index.ts';
import { $, rafThrottle } from '../ui/dom.js';
import { crore, f0, f1 } from '../ui/format.js';
import { munim } from '../cartoons/index.js';
import { byCode, model } from '../context.js';

/** Lower-case a phrase for mid-sentence use, but leave acronyms like PMFBY and MGNREGA alone. */
const phrase = name =>
  name
    .split(' ')
    .map(w => (/[A-Z]{2,}/.test(w) ? w : w.toLowerCase()))
    .join(' ');

export function mountPrescriptive(store) {
  const budget = $('#budget');
  budget.addEventListener('input', () => store.set({ budget: +budget.value }));
  $('#toonP').innerHTML = munim();

  const render = rafThrottle(({ code, october, pest, budget: b }) => {
    const s = byCode.get(code);
    budget.value = String(b);
    $('#budgetOut').textContent = `₹${f0.format(b)} cr`;
    const plan = reliefPlan({ state: s, model, october, pest, budget: b });
    const [first, second] = plan.orders;
    const spent = b - plan.unspent;
    const ratio = plan.protectedValue / Math.max(spent, 1e-9);
    const tail =
      plan.unspent > 0.5
        ? `₹${f0.format(plan.unspent)} crore stays unspent: past that point each rupee here would protect less than a rupee, so it should go to another state.`
        : ratio < 1.5
          ? 'Returns are thinning: the next rupee would do more in another state.'
          : 'Returns are still healthy at this budget.';
    $('#ledeP').textContent =
      `For ${s.name} at ₹${f0.format(b)} crore, the desk puts ₹${crore(first.spend)} crore into ${phrase(first.option.name)} and ₹${crore(second.spend)} crore into ${phrase(second.option.name)}. That protects about ₹${f0.format(plan.protectedValue)} crore of farm income, ${f1.format(ratio)}× the money spent, and leaves ₹${f0.format(plan.exposed)} crore still exposed. ${tail}`;
    $('#bubP').innerHTML =
      plan.unspent > 0.5
        ? `Hisaab saaf hai: spend <b>₹${f0.format(spent)} cr</b>, keep ₹${f0.format(plan.unspent)} cr for another state. Pehle <b>${first.option.name.split(' ')[0]}</b>.`
        : `Hisaab saaf hai: ₹${f0.format(b)} cr in, <b>₹${f0.format(plan.protectedValue)} cr</b> protected. Pehle <b>${first.option.name.split(' ')[0]}</b>.`;

    const tiny = Math.max(0.05, b / 500);
    $('#orders tbody').innerHTML = plan.orders
      .map(o => {
        const fund = o.spend >= tiny;
        return `<tr><td><span class="act ${fund ? 'fund' : 'hold'}">${fund ? 'FUND' : 'HOLD'}</span></td>
          <td style="white-space:normal;min-width:180px">${o.option.name}</td>
          <td class="n r">${fund ? crore(o.spend) : '—'}</td><td class="n r">${fund ? crore(o.benefit) : '—'}</td>
          <td class="n r">${fund ? `${f1.format(o.benefit / o.spend)}×` : '—'}</td><td class="n">${o.option.deadline}</td></tr>`;
      })
      .join('');
    const max = plan.atRisk || 1;
    $('#riskbars').innerHTML = `
      <div class="rbar"><div class="lab"><span>Before</span><span>₹${f0.format(plan.atRisk)} cr at risk · ${f1.format(plan.lossPct)}% of a ₹${f0.format(plan.cropValue)} cr crop</span></div><div class="track"><i style="width:100%;background:linear-gradient(90deg,#ff7a5c,#c8321f)"></i></div></div>
      <div class="rbar"><div class="lab"><span>After</span><span>₹${f0.format(plan.protectedValue)} cr protected · ₹${f0.format(plan.exposed)} cr left</span></div><div class="track"><i style="width:${(plan.protectedValue / max) * 100}%;background:linear-gradient(90deg,#3ddc97,#19a873)"></i><i style="width:${(plan.exposed / max) * 100}%;background:#ff5a3c;opacity:.5"></i></div></div>
      <div class="rbar"><div class="lab"><span>Budget</span><span>₹${f0.format(spent)} cr spent · ₹${f0.format(plan.unspent)} cr returned to the pool</span></div><div class="track"><i style="width:${(spent / b) * 100}%;background:linear-gradient(90deg,#ffd76b,#e09a10)"></i><i style="width:${(plan.unspent / b) * 100}%;background:rgba(163,172,217,.25)"></i></div></div>`;
    $('#cal').innerHTML = playbook(s.departure)
      .map(c => `<li><time>${c.date}</time><p>${c.title}<small>${c.detail}</small></p></li>`)
      .join('');
  });

  store.watch(['code', 'october', 'pest', 'budget'], render);
}

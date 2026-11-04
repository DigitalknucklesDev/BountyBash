export function describeDecision(plan){
 if(!plan)return 'No legal tactical continuation';
 const estimate=Number.isFinite(plan.estimate)?plan.estimate.toFixed(1):'—';
 return `${plan.description} · ${plan.rollouts} samples · ${plan.candidates} candidates · value ${estimate}`;
}

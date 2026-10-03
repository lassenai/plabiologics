// Run with: node scripts/test-research.cjs
const assert=require('node:assert/strict');
global.window={};require('../assets/research-analysis.js');
const {measure,texture}=window.PlabAnalysis;
const image=colors=>({width:colors.length,height:1,data:Uint8ClampedArray.from(colors.flatMap(c=>[...c,255]))});
const raw=image([[220,40,30],[180,170,150],[255,255,255],[0,0,0]]);
let r=measure(raw,{mode:'fibrosis',threshold:.1});
assert.equal(r.selected,4);assert.equal(r.denominator,2);assert.equal(r.numerator,1);assert.equal(r.percent,50);assert.equal(r.excluded,2);
r=measure(raw,{mode:'fibrosis',threshold:.9});assert.equal(r.numerator,0);
r=measure(raw,{mode:'fibrosis',threshold:.1,roi:[0,0,.25,1]});assert.equal(r.denominator,1);assert.equal(r.percent,100);
r=measure(image([[255,255,255]]),{mode:'fibrosis'});assert.equal(r.percent,null);
r=measure(image([[40,90,200],[200,70,90]]),{mode:'fibrosis',stain:'masson',threshold:.1});assert.equal(r.percent,50);
const uniform=image(Array.from({length:20},()=>[170,170,170]));
r=measure(uniform,{mode:'culture',texture:texture(uniform),threshold:.2});assert.equal(r.percent,0);
const alternating=image(Array.from({length:20},(_,i)=>i%2?[240,240,240]:[40,40,40]));
r=measure(alternating,{mode:'culture',texture:texture(alternating),threshold:.2});assert.equal(r.percent,100);
console.log('Passed: tissue denominator, exclusions, thresholds, ROI, empty tissue, stain direction, and texture baselines.');

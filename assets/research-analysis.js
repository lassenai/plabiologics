/* Deterministic, untrained image-processing baselines. No diagnostic model. */
'use strict';
window.PlabAnalysis = {
  texture(raw) {
    const {width:w,height:h,data}=raw, stride=w+1;
    const sum=new Float64Array(stride*(h+1)), sq=new Float64Array(sum.length);
    for(let y=0;y<h;y++){let a=0,b=0;for(let x=0;x<w;x++){
      const k=(y*w+x)*4, v=(.299*data[k]+.587*data[k+1]+.114*data[k+2])/255;
      a+=v;b+=v*v;sum[(y+1)*stride+x+1]=sum[y*stride+x+1]+a;sq[(y+1)*stride+x+1]=sq[y*stride+x+1]+b;
    }}
    const rect=(a,x0,y0,x1,y1)=>a[y1*stride+x1]-a[y0*stride+x1]-a[y1*stride+x0]+a[y0*stride+x0];
    const score=new Float32Array(w*h);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const x0=Math.max(0,x-4),y0=Math.max(0,y-4),x1=Math.min(w,x+5),y1=Math.min(h,y+5),n=(x1-x0)*(y1-y0);
      const mean=rect(sum,x0,y0,x1,y1)/n;
      score[y*w+x]=Math.min(1,Math.sqrt(Math.max(0,rect(sq,x0,y0,x1,y1)/n-mean*mean))/.13);
    }
    return score;
  },
  measure(raw,{mode,stain='sirius',threshold=.35,tissueCutoff=245,roi=[0,0,1,1],texture}) {
    const {width:w,height:h,data}=raw,positive=new Uint8Array(w*h),eligible=new Uint8Array(w*h);
    let selected=0,denominator=0,numerator=0;
    const x0=Math.floor(roi[0]*w),y0=Math.floor(roi[1]*h),x1=Math.ceil(roi[2]*w),y1=Math.ceil(roi[3]*h);
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
      const i=y*w+x,k=i*4,r=data[k],g=data[k+1],b=data[k+2],mean=(r+g+b)/3;
      selected++;
      const tissue=mode==='culture'||(mean<tissueCutoff&&mean>35);
      if(!tissue)continue;eligible[i]=1;denominator++;
      const yes=mode==='culture'?texture[i]>=threshold:stain==='sirius'?(r-Math.max(g,b))/255>=threshold:(b-r)/255>=threshold&&b>g*.9;
      if(yes){positive[i]=1;numerator++;}
    }
    return {positive,eligible,selected,denominator,numerator,percent:denominator?100*numerator/denominator:null,excluded:selected-denominator};
  }
};

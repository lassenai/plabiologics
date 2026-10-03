/* Independent culture and histology workflows; existing migration workspace is preserved. */
(() => {
  'use strict';
  const el=id=>document.getElementById(id), bi=(ko,en)=>document.documentElement.lang==='en'?en:ko;
  const article='https://doi.org/10.1186/s13287-020-02029-3';
  const figures={culture:'assets/research/kim2020-fig1.png',fibrosis:'assets/research/kim2020-fig5.png'};
  const library={
    culture:[
      {id:'kim2020-fig1b-lenti',name:'PD-MSC · Lenti',src:figures.culture,crop:[945,150,240,130],panel:'Fig. 1b'},
      {id:'kim2020-fig1b-amaxa',name:'PD-MSC · AMAXA',src:figures.culture,crop:[945,380,240,130],panel:'Fig. 1b'}
    ],
    fibrosis:[]
  };
  for(const [stain,y,height] of [['sirius',868,208],['masson',1094,188]]){
    ['Con','NTx','TTx Naïve','TTx PRL-1+'].forEach((name,i)=>library.fibrosis.push({
      id:`kim2020-fig5c-${stain}-${i}`,name,stain,src:figures.fibrosis,crop:[[81,344,609,872][i],y,250,height],panel:'Fig. 5c'
    }));
  }
  let mode='culture',sample=library.culture[0],raw=null,texture=null,result=null,view='analysis',roi=[0,0,1,1],token=0,drag=null,roiActive=false;
  const selected={culture:0,fibrosis:0},imageCache=new Map();let notes={};
  try{notes=JSON.parse(localStorage.getItem('plab-research-reviews')||'{}')}catch{}
  el('researchMain').innerHTML=`
    <section class="heading"><div><p class="eyebrow" id="rEyebrow"></p><h1 id="rTitle"></h1><p class="subtitle" id="rSubtitle"></p></div><div class="r-actions"><label class="primary upload"><span id="rUploadText"></span> ＋<input id="rUpload" type="file" accept="image/png,image/jpeg,image/webp" hidden></label><button id="rExport" class="outline"></button></div></section>
    <div class="r-context"><span class="r-status-dot"></span><span id="rContext"></span></div>
    <div class="workspace"><section class="viewer">
      <div class="viewer-toolbar"><div class="view-tabs" id="rViews"><button data-r-view="original"></button><button data-r-view="analysis" aria-pressed="true"></button><button data-r-view="split"></button></div><div class="view-actions"><button class="outline" id="rRoi"></button><button class="text-btn" id="rResetRoi"></button></div></div>
      <div class="r-stage"><div class="r-stage-head"><strong id="rSampleName"></strong><span id="rStageTag"></span></div><canvas id="rCanvas" width="1000" height="620" aria-label="Research image viewer"></canvas><p id="rError" role="alert" hidden></p><div class="r-stage-caption"><span id="rLegend"></span><span id="rDimensions"></span></div></div>
      <div class="image-foot"><span id="rProvenance"></span><button id="rOriginal" class="text-btn"></button></div>
      <div class="collection-heading"><strong id="rCollectionTitle"></strong><span id="rCount"></span></div><div id="rGallery" class="gallery"></div>
    </section><aside class="inspector">
      <section class="panel"><div class="panel-title"><h2 id="rResultsTitle"></h2><span class="tag" id="rMethodTag"></span></div><div class="metrics"><div><span id="rMetricLabel"></span><strong id="rPercent">—</strong><small id="rDenominatorLabel"></small></div><div><span id="rSecondLabel"></span><strong id="rSecond">—</strong><small id="rSecondHint"></small></div></div><p class="insight" id="rInsight" aria-live="polite"></p></section>
      <section class="panel settings"><div class="panel-title"><h2 id="rSettingsTitle"></h2><button id="rReset" class="text-btn"></button></div><div id="rStainRow"><label for="rStain" id="rStainLabel"></label><select id="rStain"><option value="sirius">Sirius red</option><option value="masson">Masson’s trichrome</option></select></div><label for="rThreshold"><span id="rThresholdLabel"></span><output id="rThresholdValue"></output></label><input id="rThreshold" type="range" min="5" max="80" value="35" step="1"><div class="range-caption"><span id="rBroad"></span><span id="rStrict"></span></div><div id="rTissueRow"><label for="rTissue"><span id="rTissueLabel"></span><output id="rTissueValue">245</output></label><input id="rTissue" type="range" min="210" max="250" value="245"><p class="hint" id="rTissueHint"></p></div><p class="hint" id="rRoiHint"></p></section>
      <section class="panel review"><div class="panel-title"><h2 id="rReviewTitle"></h2><span id="rSaved" class="save-state"></span></div><textarea id="rNote" maxlength="1000"></textarea><button class="review-button" id="rReviewed" aria-pressed="false"></button></section>
    </aside></div>
    <details class="r-methods"><summary id="rMethodsTitle"></summary><p id="rMethodsText"></p><p id="rSourceText"></p><p><a href="${article}" target="_blank" rel="noopener">Kim et al., Stem Cell Research & Therapy (2020)</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a></p></details>
    <footer><span>PLAbiologics · Research Workspace</span><span id="rFooter"></span></footer>
    <dialog id="rSourceDialog"><div class="dialog-head"><h2 id="rSourceTitle"></h2><button id="rCloseSource" class="icon-btn">×</button></div><div class="original-body"><p id="rSourceCaption"></p><img id="rSourceImage" alt=""><a class="outline" id="rDownload" download></a></div></dialog>`;
  const c=el('rCanvas'),ctx=c.getContext('2d');
  function words(){
    const culture=mode==='culture';
    const texts={
      rEyebrow:['연구 이미지 검토','Research image review'],
      rTitle:culture?['세포 배양 상태','Cell culture review']:['조직 섬유화 분석','Tissue fibrosis review'],
      rSubtitle:culture?['세포가 덮은 면적을 살펴보고 배양 이미지를 검토하세요.','Inspect estimated cell coverage and review culture images.']:['염색 양성 영역을 표시하고 조직 대비 면적을 검토하세요.','Inspect stain-positive regions and their fraction of tissue.'],
      rUploadText:['내 이미지 열기','Open my image'],rExport:['결과 저장 ↓','Export results ↓'],
      rContext:sample?.upload?['내 이미지 · 브라우저 내 분석 · 정답 검증 없음','Your image · local analysis · no reference validation']:['공개 논문 이미지 · 회사 실험 원본 아님 · 검증 전 분석 예시','Published figure images · not company raw data · unvalidated analysis example'],
      rOriginal:sample?.upload?['업로드 원본 보기 ↗','View uploaded original ↗']:['전체 논문 그림 보기 ↗','View full source figure ↗'],
      rRoi:roiActive?['영역 지정 중…','Selecting ROI…']:['분석 영역 지정','Select ROI'],rResetRoi:['전체 영역','Full image'],
      rResultsTitle:['분석 결과','Measurements'],rMethodTag:['영상처리 기준선','Image-processing baseline'],
      rMetricLabel:culture?['세포 피복률 추정','Estimated cell coverage']:['염색 양성 면적','Stain-positive area'],
      rDenominatorLabel:culture?['선택 영역 대비','Of the selected region']:['검출 조직 면적 대비','Of detected tissue'],
      rSecondLabel:culture?['배경 추정','Estimated background']:['분석 제외 면적','Excluded area'],
      rSecondHint:culture?['선택 영역 대비','Of the selected region']:['배경·극저명도 / 선택 영역','Background / selected region'],
      rSettingsTitle:['분석 설정','Analysis settings'],rReset:['초기화','Reset'],rStainLabel:['염색 종류','Stain type'],
      rThresholdLabel:culture?['텍스처 판정 기준','Texture threshold']:['색상 판정 기준','Color threshold'],
      rBroad:['넓게 탐지','Broader detection'],rStrict:['엄격하게','Stricter'],
      rTissueLabel:['조직 밝기 상한','Tissue brightness ceiling'],rTissueHint:['상한보다 밝은 픽셀과 매우 어두운 픽셀은 분모에서 제외합니다.','Pixels above this ceiling or below intensity 35 are excluded from the denominator.'],
      rRoiHint:['영역 지정 버튼을 누른 뒤 이미지 위를 드래그하세요. 수치는 선택한 영역에만 적용됩니다.','Select ROI, then drag on the image. Measurements apply only to the selected region.'],
      rReviewTitle:['검토 기록','Review notes'],rSaved:['이 기기에 저장','Saved on this device'],
      rCollectionTitle:['예제 및 내 이미지','Examples & your images'],rMethodsTitle:['분석 방법 · 출처 · 적용 범위','Methods, provenance & scope'],
      rMethodsText:culture?['주변 밝기 변화량으로 세포 후보 영역을 찾는 비학습 영상처리입니다. 세포 내부가 누락되거나 배경이 포함될 수 있습니다. 피복률은 검증 전 추정치이며 세포 수·생존율·배양 적합성 판정이 아닙니다. 원본 장변 최대 512픽셀의 분석 복사본을 사용합니다.','An untrained local-intensity-variation baseline marks candidate cell regions. It can miss cell interiors or include background. Coverage is an unvalidated estimate, not cell count, viability, or a culture-release decision. Analysis copies have a maximum dimension of 512 pixels.']:['Sirius red는 적색 우세, Masson은 청색 우세로 양성 후보를 찾습니다. 양성 픽셀 / 밝기 기준을 통과한 조직 픽셀 × 100으로 계산합니다. 정상 콜라겐과 병적 섬유화를 구별하지 않으며 병리 등급·치료 효능을 판정하지 않습니다. H&E·다른 염색에는 적용하지 마세요.','Sirius red uses red dominance and Masson uses blue dominance. The result is positive pixels / brightness-filtered tissue pixels × 100. This does not distinguish normal collagen from pathological fibrosis or assign a pathology grade or treatment efficacy. Do not use for H&E or other stains.'],
      rSourceText:['Kim 등(2020)의 Fig. 1b 배양 세포와 Fig. 5c 랫드 간 조직에서 잘라낸 예제입니다. 제목·테두리·스케일바를 피한 부분 영역으로, 논문의 전체 시야 정량값을 재현하지 않습니다. 원본 연구 이미지나 수동 정답은 제공되지 않습니다. 예제 간 시간 경과·통계적 효과를 추론할 수 없습니다. 회사 실험 조건과 업무 요구는 별도 확인이 필요합니다.','Examples are cropped regions from cultured cells in Fig. 1b and rat liver tissue in Fig. 5c of Kim et al. (2020). Crops avoid labels, borders and scale bars and do not reproduce the paper’s full-field quantification. Raw research images and manual masks are unavailable. These examples do not support time-course or statistical efficacy conclusions. Company workflows and experimental conditions require separate confirmation.'],
      rFooter:['독립 개발 연구용 MVP · 업로드는 외부 전송되지 않습니다.','Independent research MVP · uploads stay in your browser.'],
      rSourceTitle:sample?.upload?['업로드 원본','Uploaded original']:['출처 논문 그림','Source publication figure'],
      rDownload:['이미지 저장 ↓','Download image ↓']
    };
    for(const [id,pair] of Object.entries(texts))el(id).textContent=bi(...pair);
    document.querySelectorAll('[data-workflow]').forEach(b=>b.textContent=b.dataset.workflow==='culture'?bi('세포 배양','Cell culture'):b.dataset.workflow==='fibrosis'?bi('조직 섬유화','Tissue fibrosis'):bi('세포 이동','Cell migration'));
    document.querySelectorAll('[data-r-view]').forEach(b=>{b.textContent=b.dataset.rView==='original'?bi('원본 이미지','Original'):b.dataset.rView==='analysis'?bi('2D 분석','2D analysis'):bi('나란히 보기','Side by side');b.setAttribute('aria-pressed',String(b.dataset.rView===view))});
    el('rNote').placeholder=bi('경계·염색 상태·추가 확인 사항을 기록하세요.','Record boundaries, staining quality, or items to check.');el('rNote').setAttribute('aria-label',bi('검토 메모','Review note'));
    c.setAttribute('aria-label',bi('연구 이미지. 분석 영역 지정 버튼을 누른 후 드래그하여 영역을 선택합니다.','Research image. Activate Select ROI and drag to select a region.'));
    el('rCloseSource').setAttribute('aria-label',bi('원본 닫기','Close original'));
    el('rStainRow').hidden=culture;el('rTissueRow').hidden=culture;
    if(sample){el('rSampleName').textContent=sample.name;el('rStageTag').textContent=culture?'PD-MSC / '+bi('피복률 추정','coverage estimate'):el('rStain').selectedOptions[0].textContent;if(sample.upload&&culture)el('rStageTag').textContent=bi('내 배양 이미지','Uploaded culture image');el('rProvenance').textContent=sample.upload?bi('내 이미지 · 분석 복사본','Your image · analysis copy'):`Kim et al. 2020 · ${sample.panel} · CC BY 4.0`}
    el('rLegend').textContent=view==='original'?bi('분석 색상 없음','No overlay'):culture?bi('청록: 세포 후보 영역','Teal: candidate cell regions'):bi('청록: 염색 양성 후보 · 회색: 분석 제외','Teal: stain-positive candidates · gray: excluded');
    el('rRoi').setAttribute('aria-pressed',String(roiActive));
    reviewText();if(raw)update();
  }
  function key(){return mode+':'+sample.id}
  function reviewText(){if(!sample)return;const done=notes[key()]?.done;el('rReviewed').textContent=done?bi('✓ 검토 완료 · 다시 열기','✓ Reviewed · reopen'):bi('검토 완료로 표시','Mark as reviewed');el('rReviewed').setAttribute('aria-pressed',String(!!done))}
  function save(){notes[key()]={note:el('rNote').value,done:notes[key()]?.done||false};try{localStorage.setItem('plab-research-reviews',JSON.stringify(notes));el('rSaved').textContent=bi('저장됨','Saved')}catch{el('rSaved').textContent=bi('저장 실패 · CSV로 저장','Storage unavailable · export CSV')}reviewText()}
  function loadImage(src){if(!imageCache.has(src))imageCache.set(src,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error(bi('이미지를 불러올 수 없습니다. 다시 선택해 주세요.','Could not load the image. Please select it again.')));im.src=src}));return imageCache.get(src)}
  function gallery(){const list=el('rGallery');list.replaceChildren();library[mode].forEach((s,i)=>{const b=document.createElement('button');b.className='r-sample';b.setAttribute('aria-pressed',String(s===sample));const name=document.createElement('strong');name.textContent=s.name;const detail=document.createElement('span');detail.textContent=s.upload?bi('내 이미지','Uploaded'):s.stain?(s.stain==='sirius'?'Sirius red':'Masson'):s.panel;b.append(name,detail);b.onclick=()=>choose(i);list.append(b)});el('rCount').textContent=library[mode].length+' '+bi('개 이미지','images')}
  async function choose(i){
    const thisToken=++token;selected[mode]=i;sample=library[mode][i];raw=null;result=null;roi=[0,0,1,1];roiActive=false;c.classList.remove('selecting');
    el('rError').hidden=true;el('rPercent').textContent='—';el('rSecond').textContent='—';el('rExport').disabled=true;el('rNote').value=notes[key()]?.note||'';
    el('rStain').value=sample.stain||'sirius';el('rThreshold').value=mode==='culture'?35:8;el('rTissue').value=245;
    gallery();words();draw();
    try{const im=await loadImage(sample.src);if(thisToken!==token)return;
      const [x,y,w,h]=sample.crop||[0,0,im.width,im.height],scale=Math.min(1,512/Math.max(w,h));
      const copy=document.createElement('canvas');copy.width=Math.round(w*scale);copy.height=Math.round(h*scale);const cc=copy.getContext('2d');cc.fillStyle='white';cc.fillRect(0,0,copy.width,copy.height);cc.drawImage(im,x,y,w,h,0,0,copy.width,copy.height);
      raw=cc.getImageData(0,0,copy.width,copy.height);texture=mode==='culture'?window.PlabAnalysis.texture(raw):null;el('rExport').disabled=false;update();
    }catch(e){if(thisToken!==token)return;el('rError').textContent=e.message;el('rError').hidden=false;}
  }
  function update(){if(!raw)return;result=window.PlabAnalysis.measure(raw,{mode,stain:el('rStain').value,threshold:+el('rThreshold').value/100,tissueCutoff:+el('rTissue').value,roi,texture});
    el('rThresholdValue').textContent=(+el('rThreshold').value/100).toFixed(2);el('rTissueValue').textContent=el('rTissue').value;
    el('rPercent').textContent=result.percent===null?'—':result.percent.toFixed(1)+'%';el('rSecond').textContent=(mode==='culture'?100-result.percent:100*result.excluded/result.selected).toFixed(1)+'%';
    el('rInsight').textContent=!result.denominator?bi('분석할 조직이 없습니다. 원본·분석 영역·밝기 기준을 확인하세요.','No analyzable tissue. Check the original, ROI and brightness ceiling.'):mode==='culture'?bi('텍스처 기반 피복률 추정입니다. 세포 내부와 배경을 원본에서 확인하세요. 생존율이나 배양 합격 판정은 제공하지 않습니다.','Texture-based coverage estimate. Check cell interiors and background in the original. No viability or culture acceptance decision is provided.'):bi('염색 양성 후보 면적입니다. 조직의 정상 콜라겐도 포함될 수 있으므로 원본에서 확인하세요. 병리 등급은 제공하지 않습니다.','Candidate stain-positive area. Normal collagen may also be included; inspect the original. No pathology grade is assigned.');
    el('rDimensions').textContent=`${raw.width} × ${raw.height} px · ROI ${result.selected.toLocaleString()} px`;
    draw();
  }
  function bounds(){if(!raw)return null;const split=view==='split',width=split?470:940,scale=Math.min(width/raw.width,480/raw.height),w=raw.width*scale,h=raw.height*scale;return {x:split?20:(1000-w)/2,y:(620-h)/2,w,h}}
  function draw(){ctx.fillStyle='#f7fafb';ctx.fillRect(0,0,1000,620);if(!raw||!result)return;
    const copy=document.createElement('canvas');copy.width=raw.width;copy.height=raw.height;const cc=copy.getContext('2d'),b=bounds();cc.putImageData(raw,0,0);
    if(view==='original'||view==='split')ctx.drawImage(copy,b.x,b.y,b.w,b.h);
    if(view!=='original'){
      const overlay=new ImageData(new Uint8ClampedArray(raw.data),raw.width,raw.height);
      for(let i=0;i<result.positive.length;i++){const k=i*4,x=i%raw.width,y=Math.floor(i/raw.width),inside=x>=Math.floor(roi[0]*raw.width)&&x<Math.ceil(roi[2]*raw.width)&&y>=Math.floor(roi[1]*raw.height)&&y<Math.ceil(roi[3]*raw.height);
        if(!inside||!result.eligible[i]){for(let j=0;j<3;j++)overlay.data[k+j]=Math.round(overlay.data[k+j]*.45+125*.55)}
        else if(result.positive[i]){[30,170,175].forEach((v,j)=>overlay.data[k+j]=Math.round(overlay.data[k+j]*.45+v*.55))}
      }
      cc.putImageData(overlay,0,0);ctx.drawImage(copy,view==='split'?510:b.x,b.y,b.w,b.h);
    }
    if(view==='split'){ctx.font='15px sans-serif';ctx.fillStyle='#657b88';ctx.fillText(bi('원본','Original'),b.x,45);ctx.fillText(bi('분석','Analysis'),510,45)}
    ctx.strokeStyle='#282772';ctx.lineWidth=2;ctx.setLineDash([7,5]);ctx.strokeRect(b.x+roi[0]*b.w,b.y+roi[1]*b.h,(roi[2]-roi[0])*b.w,(roi[3]-roi[1])*b.h);ctx.setLineDash([]);
  }
  function point(e){const rect=c.getBoundingClientRect(),b=bounds();return [Math.max(0,Math.min(1,((e.clientX-rect.left)*1000/rect.width-b.x)/b.w)),Math.max(0,Math.min(1,((e.clientY-rect.top)*620/rect.height-b.y)/b.h))]}
  c.onpointerdown=e=>{if(!roiActive||!raw)return;drag=point(e);c.setPointerCapture(e.pointerId)};
  c.onpointermove=e=>{if(!drag)return;const p=point(e);roi=[Math.min(p[0],drag[0]),Math.min(p[1],drag[1]),Math.max(p[0],drag[0]),Math.max(p[1],drag[1])];if((roi[2]-roi[0])*raw.width>=2&&(roi[3]-roi[1])*raw.height>=2)update()};
  c.onpointerup=c.onpointercancel=e=>{if(!drag)return;drag=null;if((roi[2]-roi[0])*raw.width<2||(roi[3]-roi[1])*raw.height<2)roi=[0,0,1,1];roiActive=false;c.classList.remove('selecting');words();if(c.hasPointerCapture(e.pointerId))c.releasePointerCapture(e.pointerId)};
  el('rRoi').onclick=()=>{roiActive=!roiActive;if(roiActive){view='original'}c.classList.toggle('selecting',roiActive);words()};el('rResetRoi').onclick=()=>{roi=[0,0,1,1];update()};
  document.querySelectorAll('[data-r-view]').forEach(b=>b.onclick=()=>{view=b.dataset.rView;words()});
  ['rThreshold','rTissue'].forEach(id=>el(id).oninput=update);el('rStain').onchange=()=>{el('rThreshold').value=8;words()};
  el('rReset').onclick=()=>{el('rThreshold').value=mode==='culture'?35:8;el('rTissue').value=245;roi=[0,0,1,1];el('rStain').value=sample.stain||'sirius';words()};
  el('rNote').oninput=save;el('rReviewed').onclick=()=>{notes[key()]={...notes[key()],done:!notes[key()]?.done};save()};
  el('rOriginal').onclick=()=>{el('rSourceImage').src=sample.src;el('rSourceImage').alt=sample.name;el('rSourceCaption').textContent=sample.upload?bi('원래 해상도의 업로드 파일입니다.','Your upload at its original resolution.'):bi('분석에 사용한 부분 영역의 출처입니다. 전체 논문 그림은 분석 대상이 아닙니다.','Source of the cropped example. The whole publication figure is not analyzed.');el('rDownload').href=sample.src;el('rDownload').download=sample.upload?sample.name:`kim2020-${mode==='culture'?'fig1':'fig5'}.png`;el('rSourceDialog').showModal()};el('rCloseSource').onclick=()=>el('rSourceDialog').close();
  el('rUpload').onchange=async e=>{const file=e.target.files[0],uploadMode=mode;if(!file)return;
    try{if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>20*1024*1024)throw new Error(bi('20MB 이하 PNG·JPG·WebP를 선택하세요.','Choose a PNG, JPG, or WebP up to 20 MB.'));
      const url=URL.createObjectURL(file);try{const im=await loadImage(url);if(im.width*im.height>60000000)throw new Error(bi('6천만 픽셀 이하로 줄여 주세요.','Resize to at most 60 million pixels.'));
        library[uploadMode].push({id:`upload-${Date.now()}-${file.name}`,name:file.name,src:url,upload:true,stain:el('rStain').value});if(mode===uploadMode)await choose(library[mode].length-1);
      }catch(err){URL.revokeObjectURL(url);throw err}
    }catch(err){el('rError').textContent=err.message;el('rError').hidden=false}finally{e.target.value=''}
  };
  el('rExport').onclick=()=>{if(!result)return;const fields={workflow:mode,sample_id:sample.id,source:sample.upload?'local_upload':article,panel:sample.panel||'',source_crop_xywh:sample.crop?.join(';')||'full_image',algorithm:mode==='culture'?'local_std_texture_v1':'color_dominance_v1',validated:false,stain:mode==='fibrosis'?el('rStain').value:'',threshold:+el('rThreshold').value/100,tissue_brightness_ceiling:mode==='fibrosis'?+el('rTissue').value:'',width_px:raw.width,height_px:raw.height,roi_normalized:roi.join(';'),roi_pixels:result.selected,denominator_pixels:result.denominator,positive_pixels:result.numerator,positive_area_pct:result.percent??'',excluded_pixels:result.excluded,note:el('rNote').value,reviewed:notes[key()]?.done||false,exported_at:new Date().toISOString()};
    const esc=v=>'"'+String(v).replace(/^[=+@\-\t\r]/,m=>"'"+m).replaceAll('"','""')+'"';const csv=Object.keys(fields).map(esc).join(',')+'\r\n'+Object.values(fields).map(esc).join(',');const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`PLAB-${mode}-analysis.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  function workflow(next){++token;mode=next;document.querySelectorAll('[data-workflow]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.workflow===mode)));el('migrationMain').hidden=mode!=='migration';el('researchMain').hidden=mode==='migration';el('export').hidden=mode!=='migration';el('help').hidden=mode!=='migration';if(mode!=='migration'){view='analysis';choose(selected[mode])}}
  document.querySelectorAll('[data-workflow]').forEach(b=>b.onclick=()=>workflow(b.dataset.workflow));
  window.addEventListener('plab-language',()=>{if(mode!=='migration'){gallery();words()}else{document.querySelector('[data-workflow=culture]').textContent=bi('세포 배양','Cell culture');document.querySelector('[data-workflow=fibrosis]').textContent=bi('조직 섬유화','Tissue fibrosis');document.querySelector('[data-workflow=migration]').textContent=bi('세포 이동','Cell migration')}});
  workflow('culture');
})();

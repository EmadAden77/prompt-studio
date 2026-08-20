(function(){
  var BEDROOM_CLOTHING=[
    'تيشرت قطني أسود وشورت منزلي رمادي',
    'تيشرت قطني أبيض وشورت أسود',
    'تيشرت قطني رمادي فاتح وشورت كحلي',
    'تيشرت قطني بيج وشورت أبيض',
    'تيشرت قطني كحلي وشورت رمادي',
    'تيشرت قطني داكن واسع قليلًا وشورت منزلي',
    'تيشرت بسيط بدون طبعات وبنطلون رياضي خفيف',
    'تيشرت أبيض وبنطلون رياضي رمادي',
    'تيشرت أسود وبنطلون رياضي أسود',
    'تيشرت بيج وبنطلون منزلي قطني',
    'تيشرت طويل الأكمام خفيف وبنطلون رياضي',
    'تيشرت رياضي خفيف وشورت رياضي',
    'تيشرت نوم واسع وشورت قطني مريح',
    'فانيلة قطنية بيضاء وشورت منزلي',
    'بيجامة قطنية خفيفة رمادية',
    'بيجامة قطنية كحلية',
    'بيجامة قطنية سوداء بسيطة',
    'بيجامة مخططة بسيطة وهادئة',
    'قميص قطني منزلي خفيف وبنطلون بيجامة',
    'سويتشيرت خفيف وبنطلون رياضي مريح',
    'هودي خفيف وشورت منزلي',
    'ثوب منزلي قطني خفيف وبسيط',
    'ملابس منزلية قطنية بسيطة ومريحة',
    'ملابس نوم قطنية داكنة بدون نقوش'
  ];

  function isBedroom(){return location.hash==='#bedroom'}
  function setClothing(value){
    var input=document.getElementById('clothing');
    if(!input)return;
    input.value=value;
    input.dispatchEvent(new Event('input',{bubbles:true}));
    input.dispatchEvent(new Event('change',{bubbles:true}));
    try{
      if(typeof state==='object'&&state){state.clothing=value;if(state.userTouched)state.userTouched.clothing=true;}
      if(typeof save==='function')save();
      if(typeof syncUI==='function')syncUI();
      if(typeof autoRefresh==='function')autoRefresh();
    }catch(e){}
  }

  function install(){
    if(!isBedroom())return;
    var input=document.getElementById('clothing');
    if(!input||document.getElementById('bedroomClothingOptions'))return;

    var style=document.createElement('style');
    style.id='bedroomClothingOptionsStyle';
    style.textContent='body .smartSuggest[data-for="clothing"]{display:none!important}#bedroomClothingOptions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}#bedroomClothingOptions button{border:1px solid #34404f;background:#111821;color:#d7dee8;border-radius:999px;padding:7px 10px;font-size:11px;cursor:pointer;line-height:1.45}#bedroomClothingOptions button:active{transform:scale(.98)}#bedroomClothingTitle{display:block;color:#8fa1b5;font-size:11px;margin-top:8px;margin-bottom:2px}';
    document.head.appendChild(style);

    var title=document.createElement('small');
    title.id='bedroomClothingTitle';
    title.textContent='اقتراحات ملابس مناسبة لغرفة النوم:';

    var wrap=document.createElement('div');
    wrap.id='bedroomClothingOptions';
    BEDROOM_CLOTHING.forEach(function(item){
      var b=document.createElement('button');
      b.type='button';
      b.textContent=item;
      b.addEventListener('click',function(){setClothing(item)});
      wrap.appendChild(b);
    });

    var field=input.closest('.field');
    var anchor=field&&field.querySelector('.smartSuggest[data-for="clothing"]');
    if(anchor){anchor.insertAdjacentElement('afterend',title);title.insertAdjacentElement('afterend',wrap);}
    else{input.insertAdjacentElement('afterend',title);title.insertAdjacentElement('afterend',wrap);}
  }

  function boot(){setTimeout(install,450)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

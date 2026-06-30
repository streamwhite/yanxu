export const todos = {
  essential: [
    `i need to build a tool to upload content to bilibili automatically, not manually`,
    `it support to fill in fields`,
    `it support to upload local video file from local machine`,
    `add a md to show me different plans(includes tech stacks will be used) to build this tool`,
    `i prefer js tech stack`,
    `use common proved practices to suggest plans`,
    [
      `ensure plans also support these`,
      `ensure the account will not be blocked by proviers`,
      `allow to support more platforms like youtube,douyin,tiktok,etc`,
      `python stack also should be considered`,

      `create  plans for browser automation like openclaws or extensions, show cons and pros`,

      `change features needed: fill in all all fileds and i can manually click submit. so simi-auto should be fine with me, my biggest issues: it take a lot time to fill one by one and easy to make mistakes.`,
      `my concerns with playwright: many plats has playwright detections, i am afraid these plats also has playwright detections and after implement this tool, it still does not work or my account will be blocked, so i want it to be as safe as possible and just like a human uses when uploading content as much as possible`,
      `if i choose extension(semi pattern), which broswer is easy to implement and has less detections?`,
    ],
    [
      `use this architecture: 'semi-auto + real-browser extension+chromium based browser' to implement this tool`,
      `use modern syntax and ts and jest to test and biome to lint `,
      `do not implement those function which modern ts already has`,
      `keep functions immutable unless it is necessary not to do so`,
      `add all api to a md to document how to use this package,keep them concise and essential`,
      `continue do these until finish.`,
      `how to put into a chromium browser to run it? and how to run local server to get videos files from local machine?`,
      `set up a dev env so that no need to switch between browser and this workspace to test and debug, add to browser for every updates`,
      `always in 'Requesting native host...'`,
      `is there any existed tools to do this(what i want to build)?`,
      `表格填充太麻烦,也不好用也不灵活`,

      `in job json file, allow to add attributes like css selector or name or id to locate the input elements `,
      `for each input element, we can specify values in job json file`,
      `add button to upload video first, since each plats need uploading video first then show fields like title, description, etc`,
      `it works with upload ,how do you find the elements to upoload?`,

      `it need fill in one tag then trigger enter to add it`,
      [
        `for cover, you need to click this element, then it show a modal to upload cover, then click this element to upload cover`,
        `i will manually click a btn to close this modal if have review the cover area to show.`,
        `the cover is not uploaded, you could set uploading cover as last step when add fileds. `,
        `it does open the modal but no cover uploaded, fix it `,
        `strangely, i have to click fill fields btn again to the modal and upload cover, fix it `,
      ],
      [
        `now add more plats support: douyin, wechat 视频号`,
        `the take different field from bilibili, just add a few basic fields like title, description, for now.`,
      ],
      {
        "allow to add one by one": {
          scenario: [
            `i will open multiple tabs to upload content`,
            `check how many tabs are open, it should be more than job items for a plat`,
            `fill each job item in a tab`,
            `allow all jobs for various in one job file, the job file structure may need to be changed, and each job item should be uploaded to all plats which each plats has same video content uploaded.`,
          ],
          misc: [
            `all attributes  of a item are same.no need to differ them by plat.`,
          ],
        },
      },
      [
        `set a parent folder and use file name to find and upload files like video and cover, no need to specify absolute path`,
        `title, video name, and cover name for a item are same, so use one var to store them `,
      ],
      [
        [
          `just set uploading cover as last step for all plats when fill fields, do not rely on timeouts since it is not reliable`,
          `continue build until success `,
          `keep only batch jobs(upload and fill) for this extension, rmeove others  `,
        ],
        [
          `'Failed (insufficient_tabs): douyin: need at least 2 upload tab(s), found 1', you should do this for bilibili and wechat video号 too, and do not upload if this is not satisfied`,
        ],
        [
          `Failed (apply_failed): content_script_unreachable:page_fields_not_found:分区 → 知识`,
        ],
        [
          `for batch upload,you should check all files exist(all should exists) before upload.`,
        ],
        [
          `'<div class="upload-content"><div class="center"><span class="add-icon weui-icon-outlined-add"></span><div class="upload-tip"><span>上传时长8小时内，大小不超过20GB，建议分辨率720p及以上，码率10Mbps以内，格式为MP4/H.264格式</span><div class="weui-desktop-popover__wrp info-popover"><span class="weui-desktop-popover__target"><span class="info-icon weui-icon-outlined-info"></span></span> <div class="weui-desktop-popover weui-desktop-popover_pos-up-center" style="display: none;"><div class="weui-desktop-popover__inner"><!----> <div class="weui-desktop-popover__desc">发布视频动态，分辨率目前建议720p及以上，使用常见码流，码率10Mbps以内且原片无瑕疵，帧率60fps以内；音频建议使用AAC流，码率128kbps及以上，采样率48kHz及以上。</div> <!----></div></div></div></div></div></div>' this is wechat upload area element, you should find it and upload video to it`,
        ],
        [
          `for each plat, only the first item in job is uploaded for video(fields still not tested), it should be all items uploaded for video`,
          `ensure it works like this: if i have 2 items in job, it should be uploaded to 2 tabs for each plat for video.`,
          `for bili and wechat video号, still only the first item in job is uploaded for video(fields still not tested), it should be all items uploaded for video`,
          `douyin works fine with upload video`,
          `'douyin
2 upload pages
0, 1
each item’s .mp4', for bili and wechat video号, it should be same(all video uploaded).`,
          `'File chooser dialog can only be shown with a user activation.' this from chrome extension page(a error button on that extension card),for bili, still only the first item in job is uploaded for video(fields still not tested), wechat even has no a single video uploaded; it should be all items uploaded for video for each plat `,
        ],
        [
          `for batch upload,you should check all files(cover and video) exist(all should exists) before upload.`,
        ],
        [
          `<input class="semi-input semi-input-default" type="text" placeholder="填写作品标题，为作品获得更多流量" value=""> this is douyin title input element, you should find it and fill in the title`,
          `<div class="zone-container editor-kit-container editor editor-comp-publish notranslate chrome chrome88" data-zone-id="0" data-zone-container="*" data-slate-editor="true" contenteditable="true" spellcheck="false" style="height: 138px;" data-placeholder="添加作品简介"><div class="ace-line" data-node="true"><div data-line-wrapper="true" dir="auto"><span class="" data-leaf="true"><span data-string="true" data-enter="true">​</span></span></div></div></div> this is douyin description input element, you should find it and fill in the description`,
          `'<div class="container-FNDpwE"><div class="upload-btn-PdfuUv"><div class="upload-card-null-NkwEdF"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" fill="none" viewBox="0 0 16 12" class="null-logo-VGQMn4"><path fill="#1C1F23" fill-opacity="0.6" fill-rule="evenodd" d="M11.893 3.372a4.335 4.335 0 1 0-8.442 1.969 3 3 0 0 0 .216 5.992h7.667a4 4 0 0 0 .56-7.96M8.32 3.6a.5.5 0 0 0-.64 0L5.061 5.783a.5.5 0 0 0 .32.884h1.286V9a1 1 0 0 0 1 1h.667a1 1 0 0 0 1-1V6.667h1.285a.5.5 0 0 0 .32-.884z" clip-rule="evenodd"></path></svg><div class="inner-p-HQwLO0"><p class="inner-info-giP2vJ">点击上传</p><p class="inner-title-kg8IAW">或直接将视频文件拖入此区域</p></div><p class="inner-sub-p-q5SmoJ">为了更好的观看体验，推荐上传 9:16 的竖版视频</p></div><input class="upload-btn-input-UY_qeY" type="file" name="upload-btn" accept="video/mp4,video/x-m4v,video/x-flv,.flv,.avi,.wmv,.ts,.mp4,.mpeg4,.mov,.m4v,.mpg,.mkv,.m4,video/*"></div></div>','<div class="filter-k_CjvJ"><svg class="semi-icons semi-icons-image semi-icons-extra-large" aria-hidden="true" style="color: rgb(255, 255, 255);"><use xlink:href="#semi-icons-image"></use></svg><div class="title-wA45Xd">选择封面</div></div>', this is douyin upload area element, you should find it and upload video to it`,
          `'<div data-v-21870d77="" class="vertical-cover-wrap img-popover-wrap"><div data-v-21870d77="" class="vertical-img-wrap"><!----><div data-v-21870d77="" class="blur-wrapper blur-top"><img data-v-21870d77="" src="https://finder.video.qq.com/251/20304/stodownload?bizid=1023&amp;dotrans=0&amp;encfilekey=rjD5jyTuFrIpZ2ibE8T7YmwgiahniaXswqzIayzxhOZLtURiaUcM3BicqrBOicicJvgqeHt92nJ8yxW23s2OkdibTCv3ibias786bRyibadNDGLxguByAL3hRnEamoChw&amp;hy=SH&amp;idx=1&amp;m=&amp;scene=2&amp;token=x5Y29zUxcibB9xprd5pqicvgBoThrfhotynqsicnkGXic6SS5f4U3j8ASWG3t2dcwrzadtql9TsfDyQNQ2vXFoTZjuMEgaUaOTA9wZWDEJXia041lc8CNsqdqLw&amp;uzid=1" class="blur-img"></div><img data-v-21870d77="" src="https://finder.video.qq.com/251/20304/stodownload?bizid=1023&amp;dotrans=0&amp;encfilekey=rjD5jyTuFrIpZ2ibE8T7YmwgiahniaXswqzIayzxhOZLtURiaUcM3BicqrBOicicJvgqeHt92nJ8yxW23s2OkdibTCv3ibias786bRyibadNDGLxguByAL3hRnEamoChw&amp;hy=SH&amp;idx=1&amp;m=&amp;scene=2&amp;token=x5Y29zUxcibB9xprd5pqicvgBoThrfhotynqsicnkGXic6SS5f4U3j8ASWG3t2dcwrzadtql9TsfDyQNQ2vXFoTZjuMEgaUaOTA9wZWDEJXia041lc8CNsqdqLw&amp;uzid=1" class="vertical-img-size cover-img-horizontal-center"><div data-v-21870d77="" class="blur-wrapper blur-bottom"><img data-v-21870d77="" src="https://finder.video.qq.com/251/20304/stodownload?bizid=1023&amp;dotrans=0&amp;encfilekey=rjD5jyTuFrIpZ2ibE8T7YmwgiahniaXswqzIayzxhOZLtURiaUcM3BicqrBOicicJvgqeHt92nJ8yxW23s2OkdibTCv3ibias786bRyibadNDGLxguByAL3hRnEamoChw&amp;hy=SH&amp;idx=1&amp;m=&amp;scene=2&amp;token=x5Y29zUxcibB9xprd5pqicvgBoThrfhotynqsicnkGXic6SS5f4U3j8ASWG3t2dcwrzadtql9TsfDyQNQ2vXFoTZjuMEgaUaOTA9wZWDEJXia041lc8CNsqdqLw&amp;uzid=1" class="blur-img-bottom"></div><div data-v-21870d77="" class="edit-btn edit-btn-zIndex">编辑</div></div><div data-v-21870d77="" class="tips-wrap"><div data-v-21870d77="" class="cover-tips">个人主页卡片</div><div data-v-21870d77="" class="cover-tips">3:4</div></div></div>','<div data-v-21870d77="" class="horizon-cover-wrap img-popover-wrap"><div data-v-21870d77="" class="horizon-img-wrap"><!----><img data-v-21870d77="" src="https://finder.video.qq.com/251/20304/stodownload?bizid=1023&amp;dotrans=0&amp;encfilekey=rjD5jyTuFrIpZ2ibE8T7YmwgiahniaXswqzIayzxhOZLtURiaUcM3BicqrBOicicJvgqeHt92nJ8yxW23s2OkdibTCv3ibias786bRyibadNDGLxguByAL3hRnEamoChw&amp;hy=SH&amp;idx=1&amp;m=&amp;scene=2&amp;token=x5Y29zUxcibB9xprd5pqicvgBoThrfhotynqsicnkGXic6SS5f4U3j8ASWG3t2dcwrzadtql9TsfDyQNQ2vXFoTZjuMEgaUaOTA9wZWDEJXia041lc8CNsqdqLw&amp;uzid=1" class="horizon-img-size"><div data-v-21870d77="" class="edit-btn">编辑</div></div><div data-v-21870d77="" class="tips-wrap"><div data-v-21870d77="" class="cover-tips">分享卡片</div><div data-v-21870d77="" class="cover-tips">4:3</div></div></div>' this is channels upload area element, you should find it and upload video to it`,
          `right now, still no  single cover uploaded for douyin and channels, fix it, bibili covers is uploaded for each item`,
          `the modal shows in first item for douyin, now you need another element to upload cover:<div class="semi-upload-drag-area"><div class="semi-upload-drag-area-icon"><svg class="semi-icons semi-icons-upload semi-icons-extra-large" aria-hidden="true"><use xlink:href="#semi-icons-upload"></use></svg></div><div class="semi-upload-drag-area-text"><div class="semi-upload-drag-area-main-text">点击上传文件或拖拽文件到这里</div><div class="semi-upload-drag-area-sub-text"></div><div class="semi-upload-drag-area-tips"></div></div></div> proceed.`,
          `there are two elements for uploadin g cover: the first is open the modal, the second is upload cover, you should find the second element and upload cover`,
        ],
        [
          `<div contenteditable="" data-placeholder="添加描述" class="input-editor"></div> tihs is wechat description input element, you should find it and fill in the description`,
          `<input type="text" name="" placeholder="概括视频主要内容，字数建议6-16个字符" class="weui-desktop-form__input"> this is wechat title input element, you should find it and fill in the title`,
          `<label class="ant-checkbox-wrapper"><span class="ant-checkbox"><input type="checkbox" class="ant-checkbox-input" value=""><span class="ant-checkbox-inner"></span></span><span>声明后，作品将展示原创标记，有机会获得广告收入。</span></label> this is wechat source type input element, you should find it and check it then confirm the popup with element <div class="original-proto-wrapper"><label class="ant-checkbox-wrapper ant-checkbox-wrapper-checked"><span class="ant-checkbox ant-checkbox-checked"><input type="checkbox" class="ant-checkbox-input" value=""><span class="ant-checkbox-inner"></span></span></label><div class="protocol-text"> 我已阅读并同意<a href="https://support.weixin.qq.com/cgi-bin/mmsupportacctnodeweb-bin/pages/s6zCQ8q4oR2FpRXe" target="_blank">《原创声明须知》</a>和<a href="https://support.weixin.qq.com/cgi-bin/mmsupportacctnodeweb-bin/pages/GzdzwPjCFZDCZkmI" target="_blank">《使用条款》</a>。如滥用声明，平台将驳回并予以相关处置。 </div></div>`,
          `then click this btn on popup to confirm the source type:<button type="button" class="weui-desktop-btn weui-desktop-btn_primary">声明原创</button>`,
          `douyin works for both items, not work for channels for both items`,
        ],

        [
          `'Failed (insufficient_tabs): douyin: 2 job items → need 2 upload page tab(s), found 0' when i have two douyin tabs and after click fill fields, i still get this err, fix it.`,
          `https://creator.douyin.com/creator-micro/content/upload->https://creator.douyin.com/creator-micro/content/post/video?enter_from=publish_page after upload video.`,
        ],
        [
          `when click fill fields, only the first item in job is filled for bili plat, it should be all items filled for all plats corresponding to the job item`,
        ],
      ],
    ],
    [
      `enhancements`,
      `use bootstrap to make UI look good but keep it simple `,
      `once clicked, always show the popup windows until closed it`,
      `default targets is all 3 plats: bilibili, douyin, channels unless specified`,
      `when upload video and cover, try to be concurrent if possible, at least betwwen each plats`,
      `do not build every when in dev`,
      `知识分区,Failed (apply_failed): content_script_unreachable:page_fields_not_found:分区 → 知识, even it is there, i guess it is timing caused.`,
      `show notice  for each fileds filled and video uploaded when each field success filled, i use that to make sure video uploaded and fields are filled correctly.`,
      `disable fill fields button when video is not all uploaded, and enable it when video is all uploaded.`,
      `bash to setup host machine to run this tool so user can set up with this one script to setup host after install extension, and then user can start use this extension directly, no further set up operations.`,
      `add a btn to open a specific amount of tabs for a specific plat, base on job items `,
      `merge upload to and fill fields to one button, you may need some(make this configurable) timeout(or better ways) for page load fileds before filling fields`,
      `make items concurrent in a platform, but with a random delay between 1 to 3 seconds.`,
    ],
    [
      `these fields use current as default values, remove these fileds from exmaple json since it is optional`,
    ],
    [
      `'<div data-v-48c02e61="" class="statement-content"><div data-v-48c02e61="" class="bcc-select" style="width: 360px;"><div class="bcc-select-input-wrap"><input type="text" readonly="readonly" placeholder="请选择符合您视频内容的创作声明" class="bcc-select-input-inner"><i class="bcc-iconfont bcc-icon-ic_drop-down"></i></div><div class="bcc-select-list-wrap" style="display: none;"><ul class="bcc-select-option-list"><article data-v-863f2d82="" data-v-48c02e61="" class="vu-hover-tips option-hover-tips"><section data-v-863f2d82="" class="vuht-wrapper"></section><li data-v-48c02e61="" class="bcc-option" data-v-863f2d82=""><span data-v-48c02e61="">内容无需标注</span><i class="bcc-iconfont bcc-icon-ic_MenuButton-tick"></i></li></article><article data-v-863f2d82="" data-v-48c02e61="" class="vu-hover-tips option-hover-tips"><section data-v-863f2d82="" class="vuht-wrapper"></section><li data-v-48c02e61="" class="bcc-option" data-v-863f2d82=""><span data-v-48c02e61="">含AI生成内容</span><i class="bcc-iconfont bcc-icon-ic_MenuButton-tick"></i></li></article><article data-v-863f2d82="" data-v-48c02e61="" class="vu-hover-tips option-hover-tips"><section data-v-863f2d82="" class="vuht-wrapper"></section><li data-v-48c02e61="" class="bcc-option" data-v-863f2d82=""><span data-v-48c02e61="">含虚构演绎内容</span><i class="bcc-iconfont bcc-icon-ic_MenuButton-tick"></i></li></article><article data-v-863f2d82="" data-v-48c02e61="" class="vu-hover-tips option-hover-tips"><section data-v-863f2d82="" class="vuht-wrapper"></section><li data-v-48c02e61="" class="bcc-option" data-v-863f2d82=""><span data-v-48c02e61="">内容含营销信息</span><i class="bcc-iconfont bcc-icon-ic_MenuButton-tick"></i></li></article><article data-v-863f2d82="" data-v-48c02e61="" class="vu-hover-tips option-hover-tips"><section data-v-863f2d82="" class="vuht-wrapper"></section><li data-v-48c02e61="" class="bcc-option" data-v-863f2d82=""><span data-v-48c02e61="">个人观点，仅供参考</span><i class="bcc-iconfont bcc-icon-ic_MenuButton-tick"></i></li></article><article data-v-863f2d82="" data-v-48c02e61="" class="vu-hover-tips option-hover-tips"><section data-v-863f2d82="" class="vuht-wrapper"></section><li data-v-48c02e61="" class="bcc-option" data-v-863f2d82=""><span data-v-48c02e61="">内容为转载</span><i class="bcc-iconfont bcc-icon-ic_MenuButton-tick"></i></li></article><div data-v-48c02e61="" class="option-divider"></div><div data-v-48c02e61="" class="auth-title">是否添加内容授权声明（非必选）</div><article data-v-863f2d82="" data-v-48c02e61="" class="vu-hover-tips option-hover-tips"><section data-v-863f2d82="" class="vuht-wrapper"></section><div data-v-48c02e61="" data-v-863f2d82="" class="auth-content"><span data-v-48c02e61="" data-v-863f2d82="" class="option-text">内容为自制：未经作者允许，禁止转载</span><!----></div></article></ul></div></div></div>' bili has this new filed to fill, default select '内容无需标注' and '内容为自制：未经作者允许，禁止转载'`,
    ],
    [
      `wechat seems need a tab to be active(user current on this) to upload video, make this extension do so: make it active when upload video and fill fields, this may need wechat tabs done sequentially`,
      `remove all messages like this: 'channels item 1: div.input-editor[contenteditable][data-placeholder="添加描述"] | div[contenteditable][data-placeholder="添加描述"] | textarea[placeholder*="描述"] | div[contenteditable="true"][data-placeholder*="描述"] | textarea[placeholder*="简介"] | div[contenteditable="true"][data-placeholder*="简介"]'
`,
      `one btn to open all tabs for job, not each plat has a btn to open tabs`,
    ],
    [
      `'Opening upload tabs for all platforms…', for over 30s, no single tab is opened, fix it`,
    ],
    [
      `for douyin, some covers is not uploaded(but the modal are all shown for these cases), fix it`,
      `for channels, it should be checking <div class="form-item-body"><div class="declare-origina
      l-checkbox"><label class="ant-checkbox-wrapper"><span class="ant-checkbox"><input type="checkbox" class="ant-checkbox-input" value=""><span class="ant-checkbox-inner"></span></span><span>声明后，作品将展示原创标记，有机会获得广告收入。</span></label></div></div>, then check <div class="original-proto-wrapper"><label class="ant-checkbox-wrapper ant-checkbox-wrapper-checked"><span class="ant-checkbox ant-checkbox-checked"><input type="checkbox" class="ant-checkbox-input" value=""><span class="ant-checkbox-inner"></span></span></label><div class="protocol-text"> 我已阅读并同意<a href="https://support.weixin.qq.com/cgi-bin/mmsupportacctnodeweb-bin/pages/s6zCQ8q4oR2FpRXe" target="_blank">《原创声明须知》</a>和<a href="https://support.weixin.qq.com/cgi-bin/mmsupportacctnodeweb-bin/pages/GzdzwPjCFZDCZkmI" target="_blank">《使用条款》</a>。如滥用声明，平台将驳回并予以相关处置。 </div></div>`,
      `for channels, some tabs has no video uploaded, and some pause in uploading, fix it`,
    ],
    [`for bili and partition field, still wrong value used, fix it`],
    [
      `wechat, two issue: statement still not checked, now all video uploaded, but some covers not uploaded, fix it`,
      `for bili, partition field still wrong value used, fix it`,
      `for wechat, once open tabs btn clicked, you still have to refresh each tab since wechat does not load content when only opened without be on that page(active), use better way to handle this if you can`,
      `try use this way: simulate human behavior: for bili and wechat, upload video and then fill fields sequentially(including cover),then go to next item(tab)`,
      `this may take longer time, change related timeout if it has and needed.`,
    ],
    `截止`,
    [
      `for bili,partition still not working,you just set this ele <p data-v-18fb52cf="" class="select-item-cont select-item-cont-inserted"> 知识 </p> content`,
      `for wechat, it does not fill fileds: desc <div class="form-item-body"><div class="post-desc-box"><div contenteditable="" data-placeholder="添加描述" class="input-editor"></div><!----><div class="quick-btns"><div class="finder-tag-wrap btn"><div class="tag-inner">#话题</div></div><div class="finder-tag-wrap btn"><div class="tag-inner">@视频号</div></div></div><!----><!----></div></div>; vertical cover <div data-v-21870d77="" class="vertical-cover-wrap img-popover-wrap"><div data-v-21870d77="" class="vertical-img-wrap"><!----><div data-v-21870d77="" class="blur-wrapper blur-top"><img data-v-21870d77="" src="https://finder.video.qq.com/251/20304/stodownload?bizid=1023&amp;dotrans=0&amp;encfilekey=rjD5jyTuFrIpZ2ibE8T7YmwgiahniaXswqziac8AtHBIz2DtlsxwEXpITHQ3NlCHENvPtP6B1FCdWLfux521GrL8NOLMqtA4Kcks6mpTsuKFcj7xsDB6W5MGbA&amp;hy=SH&amp;idx=1&amp;m=&amp;scene=2&amp;token=AxricY7RBHdXicwl5JnzGbFkTbkS6pC0tc1KmQk1h0QYyiayWRsGicxhmluaXpB04fun7iaUKvkmzGrd49micTnAGIpkDGicgLLnopheBYAFoibLSzQ5He9u1h6cNA&amp;uzid=1" class="blur-img"></div><img data-v-21870d77="" src="https://finder.video.qq.com/251/20304/stodownload?bizid=1023&amp;dotrans=0&amp;encfilekey=rjD5jyTuFrIpZ2ibE8T7YmwgiahniaXswqziac8AtHBIz2DtlsxwEXpITHQ3NlCHENvPtP6B1FCdWLfux521GrL8NOLMqtA4Kcks6mpTsuKFcj7xsDB6W5MGbA&amp;hy=SH&amp;idx=1&amp;m=&amp;scene=2&amp;token=AxricY7RBHdXicwl5JnzGbFkTbkS6pC0tc1KmQk1h0QYyiayWRsGicxhmluaXpB04fun7iaUKvkmzGrd49micTnAGIpkDGicgLLnopheBYAFoibLSzQ5He9u1h6cNA&amp;uzid=1" class="vertical-img-size cover-img-horizontal-center"><div data-v-21870d77="" class="blur-wrapper blur-bottom"><img data-v-21870d77="" src="https://finder.video.qq.com/251/20304/stodownload?bizid=1023&amp;dotrans=0&amp;encfilekey=rjD5jyTuFrIpZ2ibE8T7YmwgiahniaXswqziac8AtHBIz2DtlsxwEXpITHQ3NlCHENvPtP6B1FCdWLfux521GrL8NOLMqtA4Kcks6mpTsuKFcj7xsDB6W5MGbA&amp;hy=SH&amp;idx=1&amp;m=&amp;scene=2&amp;token=AxricY7RBHdXicwl5JnzGbFkTbkS6pC0tc1KmQk1h0QYyiayWRsGicxhmluaXpB04fun7iaUKvkmzGrd49micTnAGIpkDGicgLLnopheBYAFoibLSzQ5He9u1h6cNA&amp;uzid=1" class="blur-img-bottom"></div><div data-v-21870d77="" class="edit-btn edit-btn-zIndex">编辑</div></div><div data-v-21870d77="" class="tips-wrap"><div data-v-21870d77="" class="cover-tips">个人主页卡片</div><div data-v-21870d77="" class="cover-tips">3:4</div></div></div>; horizontal cover <div data-v-21870d77="" class="horizon-cover-wrap img-popover-wrap"><div data-v-21870d77="" class="horizon-img-wrap"><!----><img data-v-21870d77="" src="https://finder.video.qq.com/251/20304/stodownload?bizid=1023&amp;dotrans=0&amp;encfilekey=rjD5jyTuFrIpZ2ibE8T7YmwgiahniaXswqziac8AtHBIz2DtlsxwEXpITHQ3NlCHENvPtP6B1FCdWLfux521GrL8NOLMqtA4Kcks6mpTsuKFcj7xsDB6W5MGbA&amp;hy=SH&amp;idx=1&amp;m=&amp;scene=2&amp;token=AxricY7RBHdXicwl5JnzGbFkTbkS6pC0tc1KmQk1h0QYyiayWRsGicxhmluaXpB04fun7iaUKvkmzGrd49micTnAGIpkDGicgLLnopheBYAFoibLSzQ5He9u1h6cNA&amp;uzid=1" class="horizon-img-size"><div data-v-21870d77="" class="edit-btn">编辑</div></div><div data-v-21870d77="" class="tips-wrap"><div data-v-21870d77="" class="cover-tips">分享卡片</div><div data-v-21870d77="" class="cover-tips">4:3</div></div></div>; short title <div data-v-407ec1e2="" class="form-item-body short-title-wrap"><div data-v-371386de="" data-v-407ec1e2="" class="post-short-title-wrap"><div data-v-371386de="" class="input weui-desktop-form__input-area"><span class="weui-desktop-form__input-wrp"><!----> <!----> <!----> <!----> <input type="text" name="" placeholder="填写短标题有机会获得更多流量" class="weui-desktop-form__input"> <!----> <!----> <!----></span> <!----> <!----></div><!----></div></div>`,
    ],
    [
      `for bili and partition field, use some thing like 'document.querySelector("#video-up-app > div.video-basic-wrp > div.video-basic > div.form > div:nth-child(5) > div > div.selector-container > div > div > p").textContent=' 人工智能 '
'to set it. maybe only 'div.selector-container' will do . `,
    ],
    [
      `for wechat, sitll no a single filed filled.fix it. and i got 'Failed (batch_partial_failed): video_file_input_not_found:channels:item_0' even the video is uploaded.`,
      `for wechat, i got 'channels item 0: channels item 0 (tab 1585893422): video_file_input_not_found:channels:item_0
channels item 1: channels item 1 (tab 1585893423): video_file_input_not_found:channels:item_1
',still only video uploaded, no a single field filled.`,
      `for wechat, i got 'Failed (tab_apply_failed): video_file_input_not_found:channels:item_0
',still only video uploaded, no a single field filled.`,
      `now only thumbnail is not uploaded, fix it.`,
      `make uploading thumbnail as last step, so we can avoid timing issues since we need to fill other fields.and scine i saw it show and quick closed for uploading thumbnail modal`,
      `for wechat, remove related code of uploading horizontal cover field, since only one allowed to upload same time, i will manually upload horizontal cover. `,
    ],
    `微信可能需要点击每个标签.`,
  ],

  questions: [`how native message works? better ways to do ?`],
  made_decisions: [
    `保持一个浏览器即可,节省时间,每个系统chrome都是主要浏览器`,
    `后续再考虑付费的情况,以及相关的问题:比如会自动删除, 每次系统重启后;does this require nodejs in host to work?,
`,
    [
      [
        `ensure you do not sned request when upload video and when upload image, you just fill in the fields, `,
        `i mean you you still fill video and cover, but not send request to plats`,
        `分发的时候才考虑这些问题`,
        `中文UI`,
        `limit to 15 a day.`,
        `limit job items up to 10(configrable) items`,
        `更改名字`,
        `Opens bilibili, douyin, and 视频号 tabs — one per job item per platform.
Batch job (v3) — open tabs, upload, fill. Publish manually.


`,
        `提示微信必须先登陆,不然每个打开都需要登陆一次.`,
        `完成没有一个明确的指示`,
        `不需要显示哪个完成了,比如field`,
        `速度还是很慢的,微信`,
      ],
    ],
    [
      `删除,暂时使用不多(需要删除的少,而且手动还行吧.),没必要创建,还是需要的旧的视频.`,
      `自己翻页,直到最后一页,怎么判断.算了手动吧.`,
      `旧的视频全部删掉,电影相关的.简单制作的.`,
    ],
    [
      `for bili, no more 	BILIBILI_SOURCE_TYPE_LABEL_ORIGINAL,
	BILIBILI_SOURCE_TYPE_LABEL_REPOST, it is replaced by '请选择符合您视频内容的创作声明', so remove related code.
`,
    ],
    [
      `for wechat, you need to keep page active when uploading video and filling fields`,
      `it does not upload a single video for wechat, after manual uploaded, filling fields works`,
    ],
    [
      `i get this in extension page:'File chooser dialog can only be shown with a user activation.
'`,
      `and it only upload to wechat when i click one wechat tab(before i click it stop at bili(filled successfuly) tab).`,
      `Error in event handler: TypeError: runWithServiceWorkerKeepAlive(...) is not a function at chrome-extension://icgamjidfldplplcdkacjgmikpebhmaj/dist/sw.js:5952:7
Error in event handler: TypeError: runWithServiceWorkerKeepAlive(...) is not a function at chrome-extension://icgamjidfldplplcdkacjgmikpebhmaj/dist/sw.js:5914:7 get these, i did not click wechat tab, it is stop at bili tab,.
`,
      `no error more, but video still not uploaded to all wechat tabs, fix it.`,
      `just keep wechat tab active when uploading video and filling fields, fix it.`,
      `Uncaught (in promise) Error: Tabs cannot be edited right now (user may be dragging a tab). dist/sw.js:4733 (anonymous function)

      now the video is uploaded and fields are filled, but not with cover, it shows when i click upload cover: '文件上传中，请等待完成后再编辑'.
`,
      `no more error, but cover still not upload-able, still show '文件上传中，请等待完成后再编辑'. i guess it could be you upload video again since i found that: after the video is uploaded, it can upload cover for a short while, but then it is not upload-able and stay that status.`,
      `now it is uploadable for wechat cover, but it is not uploaded. i stay on first wechat tab long and long`,
      `create a new branch to do these: `,
      `for douyin and wechat, upload vertical cover first(need close modal after upload vertical cover) then upload horizontal cover and stay on that modal(i will review it). douyin vertical upload element(horizontal upload element already exists):<div class="coverControl-CjlzqC" style="margin-right: 8px; width: 90px;"><div class="cover-Jg3T4p" style="height: 120px;"><div class="background-OpVteV filter-k_CjvJ" style="background-image: none;"></div><div class="filter-k_CjvJ"><svg class="semi-icons semi-icons-image semi-icons-extra-large" aria-hidden="true" style="color: rgb(255, 255, 255);"><use xlink:href="#semi-icons-image"></use></svg><div class="title-wA45Xd">选择封面</div></div></div><div class="controlContainer-psV7_j"><div class="cover-tip-YkBvmu">竖封面3:4</div></div></div>;wechat horizontal upload element(vertical upload element already exists):<div data-v-21870d77="" class="horizon-cover-wrap img-popover-wrap"><div data-v-21870d77="" class="horizon-img-wrap"><!----><img data-v-21870d77="" src="https://finder.video.qq.com/251/20304/stodownload?bizid=1023&amp;dotrans=0&amp;encfilekey=rjD5jyTuFrIpZ2ibE8T7YmwgiahniaXswqzqqJq1YTsXA5QicCbEUicW8WJHtzh4q4EeEIRLkibxv8K3SxdTUw66LeQcwCovVU1sTRAHWQPuibuTLCZeEG3CzLgfg&amp;hy=SH&amp;idx=1&amp;m=&amp;scene=2&amp;token=AxricY7RBHdUuQkbb4fZw9yh03fAqaqwtMqDxXxhNxibUjl9HQqp4vlVJrpDgOXyWzA1oo5AYhvwGo3hUbhu8VKs34AVuwuxdwAXq26xlTXHDicwhZrEqMiaKQ&amp;uzid=1" class="horizon-img-size"><div data-v-21870d77="" class="edit-btn">编辑</div></div><div data-v-21870d77="" class="tips-wrap"><div data-v-21870d77="" class="cover-tips">分享卡片</div><div data-v-21870d77="" class="cover-tips">4:3</div></div></div>`,
      `now wechat vertical cover is not uploaded, horizontal cover is uploaded, fix it.`,
      `goal:for douyin and wechat, you need to upload vertical cover first, then upload horizontal cover and stay on that modal(i will review it).for douyin, you  use this element '<button tabindex="0" class="semi-button semi-button-primary semi-button-light primary-RstHX_" type="button" aria-describedby="0saknbi" data-popupid="0saknbi" style=""><span class="semi-button-content">设置横封面</span></button>' to switch to horizontal cover upload area after upload vertical cover(no need to close modal, after switch stay on that modal); for wechat, you need to click the ele '<div data-v-6de9e5d2="" class="weui-desktop-btn_wrp"><button type="button" class="weui-desktop-btn weui-desktop-btn_primary weui-desktop-btn_mini">确认</button></div>' btn on modal to close modal  after uploading vertical cover, then start to upload horizontal cover. `,
      `for douyin, you need to stay on that modal with horizontal cover(no need to close modal and upload horizontal cover since it reuse the same cover as vertical cover)`,
      `for wechat, you need to close verical cover uploading modal then upload horizontal cover, then this ele '<div data-v-21870d77="" class="weui-desktop-btn_wrp btn-use"><button type="button" class="weui-desktop-btn weui-desktop-btn_primary weui-desktop-btn_mini">使用素材</button></div>'shows up, click it to reuse the same cover as vertical cover, stay on that modal(do not close it)`,
      `proceed`,
      `douyin works; wechat still stay on vertical cover uploading modal, proceed. remember to click '<div data-v-6de9e5d2="" class="weui-desktop-btn_wrp"><button type="button" class="weui-desktop-btn weui-desktop-btn_primary weui-desktop-btn_mini">确认</button></div>' btn on modal to close modal  after uploading vertical cover, then start to upload horizontal cover. `,
      `for wechat, when you clicked uploading horizontal cover, you need to click '<div data-v-21870d77="" class="weui-desktop-btn_wrp btn-use"><button type="button" class="weui-desktop-btn weui-desktop-btn_primary weui-desktop-btn_mini">使用素材</button></div>' btn on another smaller modal to reuse vertical cover. right now it stay on the smaller modal.`,
      `allow jpg as cover extension`,
      `add a option to upload(and filling fields and open wechat tabs) to wechat only(when checked) since some times wechat block multiple uploading within short time. i need to re-upload(filling fields) again later.i will update Batch job file to those need re-upload(filling fields). `,
      `i have tested for auto submit for bili, it only submitted current active tab, the other tab(i have only 2 for test) is not submitted. fix it. other plats could have same issue, check and fix it.`,
      `now auto submit for bili and wechat works, but not for douyin, check and fix it. douyin btn to submit is '<span id="popover-tip-container" class=""><button class="button-dhlUZE primary-cECiOJ fixed-J9O8Yw" style="width: 120px; height: 32px;">发布</button></span>'`,
      `i did not see the option(checkbox for wechat only) in extension page, fix it.`,
      `for wechat and for submit, use batch to submit, make batch size(default 5), interval between batches(default 5mins since it has rate limit for a short time)`,
      `when upload and filling field for wechat only, show the job items to let me multiple slect the ones to upload since some  are already uploaded and filled.`,
      `now put submit checkbox and submit button into one for all 3 plats, but still keep features for wechat to not submit all once(avoid rate limit for wechat)  `,
      `one btn for 3 plats to submit`,
    ],
  ],
  knowledge: [
    `插件开发只能使用输出问题来调试,没法进行断点,不然看不到是哪里出了问题,问下.`,
    `但是tests还是可以运行,保证unit正常.`,
  ],
};

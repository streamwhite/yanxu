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
      ],
    ],
    [
      `enhancements`,
      `set a parent folder and use file name to find and upload files like video and cover, no need to specify absolute path`,
      `allow to add one by one, five open. add them`,
    ],
  ],
};

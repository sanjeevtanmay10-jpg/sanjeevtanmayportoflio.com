/* Written case studies. Each chapter: heading (h), paragraphs (t), optional list of [term, text] (list),
   and figures (figs) that point at keys in js/images.js. Figures open full size on click. */
window.STORY = {
  splitright: {
    lead: { k: 'sr-hero', alt: 'SplitRight welcome screen on a phone, surrounded by friends and what each of them contributed' },
    chapters: [
      { h: 'The problem', t: [
        'Friends rarely eat or use the same things, yet most bill-splitting apps either divide the total equally or make you do the maths by hand.',
        'That leads to confusion, small disputes and awkward money conversations, especially for students and people on a tight budget.'
      ] },
      { h: 'The solution', t: [
        'SplitRight splits by what each person actually had. You add the items on the bill, mark who shared each one, and the app works out every share, including each person’s part of the GST.'
      ] },
      { h: 'Timeline', t: [
        'Three months, one phase per month. August was research, discovery and defining the problem. September covered the user flow, design system and branding. October went into low-fidelity sketches, mid-fidelity wireframes and the final screens.'
      ], figs: [{ k: 'sr-timeline', alt: 'Project timeline across August, September and October, with three phases per month', cap: 'Ten days per phase, August to October.' }] },
      { h: 'Who it’s for', t: [
        'Two personas came out of the research. Jhanvi, 22, is a student in Delhi who shares groceries, café visits and outings with her roommate and friends. She wants to stay on good terms with them, and chasing people for money feels uncomfortable.',
        'Pritam, 21, is a student who travels with friends on a limited budget. He doesn’t want to pay for things he didn’t have, and he loses track of who paid for what.',
        'Both want the same thing: pay only their own share, and see at a glance who owes what.'
      ], figs: [{ k: 'sr-persona', alt: 'Persona cards for Jhanvi Malik and Pritam Chetri with their challenges and goals', cap: 'Personas: Jhanvi and Pritam.' }] },
      { h: 'What they say, think and feel', t: [
        'Empathy maps for both personas. The same thoughts kept coming back: “We all ordered different things. Why should we split the bill equally?” and “I don’t want money to affect my friendships.”'
      ], figs: [{ k: 'sr-empathy', alt: 'Empathy maps for Jhanvi and Pritam: what they say, think, feel and do', cap: 'Empathy maps.' }] },
      { h: 'User interviews', t: [
        'I interviewed students and freelancers, including a master’s student, about how they split shared expenses today.'
      ], figs: [{ k: 'sr-interview', alt: 'Photos from user interviews with students and freelancers', cap: 'Interview sessions.' }] },
      { h: 'User flows', t: [
        'Three flows cover the core jobs:'
      ], list: [
        ['Onboarding', 'welcome screen, how it works, then sign up or log in.'],
        ['Add people and money', 'add participants, add items and amounts, save and continue.'],
        ['Scan a bill', 'open the camera, scan the bill, pick the items you had and confirm the split.']
      ], figs: [{ k: 'sr-userflow', alt: 'Flowcharts for onboarding, adding participants and money, and scanning a bill', cap: 'Three scenarios.' }] },
      { h: 'Logo and brand', t: [
        'The logo started as sketches of a table, people and a shared bowl. The final mark shows two people side by side, and it carries through to the app icon and the store listing.'
      ], figs: [
        { k: 'sr-logo', alt: 'Hand-drawn logo sketches for SplitRight', cap: 'Logo sketches.' },
        { k: 'sr-branding', alt: 'SplitRight logo, app store listing and app icon on a phone', cap: 'The brand in use.' }
      ] },
      { h: 'Design system', t: [
        'Manrope for headings and Inter for body text, from 12 to 64 pt. One brand indigo (#3525CD) with a full range of tints and shades, green for money you get, red for money you owe, and a neutral scale.',
        'The components are built around the split itself: contribution chips, balance cards and the bill breakdown.'
      ], figs: [
        { k: 'sr-type-colour', alt: 'Typography with Manrope and Inter, and colour scales for brand, success, error and neutral', cap: 'Type and colour.' },
        { k: 'sr-components', alt: 'Icons and components: buttons, contribution chips, balance card and bill breakdown', cap: 'Icons and components.' }
      ] },
      { h: 'Wireframes', t: [
        'Low-fidelity sketches for every screen first, then mid-fidelity wireframes to settle layout and flow before adding colour.'
      ], figs: [
        { k: 'sr-lowfi', alt: 'Hand-drawn low-fidelity wireframes of the app screens', cap: 'Low fidelity.' },
        { k: 'sr-midfi', alt: 'Greyscale mid-fidelity wireframes of the app screens', cap: 'Mid fidelity.' }
      ] },
      { h: 'Final screens', t: [
        'Onboarding, account creation, choosing who is splitting, adding items, the bill scanner, the split summary and the profile.'
      ], figs: [{ k: 'sr-screens', alt: 'Final SplitRight app screens in colour', cap: 'Main screens.' }] },
      { h: 'Prototype and launch', t: [
        'Every screen is linked in a clickable Figma prototype. To show how the brand could launch, I also designed a billboard: “Good food. Better friends. Fair splits.”'
      ], figs: [
        { k: 'sr-proto', alt: 'Figma prototype connections between all SplitRight screens', cap: 'Prototype wiring in Figma.' },
        { k: 'sr-billboard', alt: 'SplitRight billboard on a street at dusk', cap: 'Launch billboard.' }
      ] }
    ]
  },

  postfolio: {
    lead: null,
    chapters: [
      { h: 'The wall', t: [
        'Ten posters across typography, illustration and photo-based work, hung as a baroque gallery wall with gold frames, cherubs and damask. Scroll slowly; each frame is a different brief.'
      ], figs: [
        { k: 'pf-1', alt: 'Gallery wall with a Valentine’s poster, a 2024 typography poster and two dark photo posters in gold frames', cap: '' },
        { k: 'pf-2', alt: 'Gallery wall with a magazine-style poster and an architectural illustration in gold frames', cap: '' },
        { k: 'pf-3', alt: 'Gallery wall with a typography poster, a 3D building, a green podium scene and a Christmas tree poster', cap: '' }
      ] }
    ]
  },

  atelier: {
    lead: { k: 'at-hi-home', alt: 'Atelier home page: five framed masterpieces around the headline “Step inside the frame”' },
    chapters: [
      { h: 'The problem', t: [
        'Most art gallery websites put too much text next to each painting. Visitors get overwhelmed by long descriptions and lose interest, so they leave without really understanding the artwork, even when they were curious to learn more.'
      ] },
      { h: 'The goal', t: [
        'Make learning about art feel effortless, not like reading a textbook. Keep visitors curious long enough to understand each work, in a digital museum where the art stays the focus and the story comes to life.'
      ] },
      { h: 'The solution', t: [
        'A narrated audio guide tells each artwork’s story in five short chapters. A live transcript highlights each sentence as it’s spoken, so visitors can listen, read along or jump to any part.',
        'Era-themed gallery rooms, uncropped artworks and very little text keep the experience calm.'
      ], figs: [{ k: 'at-hi-story', alt: 'Story mode for Girl with a Pearl Earring: chapter list, live transcript and audio player', cap: 'Story mode: chapters, transcript and player.' }] },
      { h: 'Ideas and sketches', t: [
        'Paper sketches of the page layout and the audio player, plus a mind map of everything a gallery means: canvas, texture, storytelling, history, display.'
      ], figs: [{ k: 'at-ideation', alt: 'Hand-drawn layout sketch, audio player sketch and an “Art gallery” mind map', cap: 'Ideation.' }] },
      { h: 'Inspiration and mood', t: [
        'The look comes from real galleries and record sleeves: ivory, charcoal, gilt and bronze. Instrument Serif for artist and artwork names, Inter for the interface.',
        'Each master gets a room in the colour of their era: red for the Renaissance, green for the Dutch Golden Age, light oak for Post-Impressionism and white for Modernism.'
      ], figs: [
        { k: 'at-inspiration', alt: 'Inspiration board: Rabo Art Collection, a storytelling site and The Boring Blog', cap: 'Inspiration board.' },
        { k: 'at-moodboard', alt: 'Moodboard with gallery photos, colour palette, typography and gallery rooms by era', cap: 'Moodboard, palette, type and rooms.' }
      ] },
      { h: 'Flow and site map', t: [
        'Visitors discover, listen and learn: land, choose a master, enter their room, pick a work and play its story, or read the essentials instead. “Surprise me” opens a random artwork for people who just want to wander.',
        'Five rooms, twenty-five works. Every artwork has its own address, so any piece can be shared directly.'
      ], figs: [
        { k: 'at-userflow', alt: 'User flow from landing to story mode, with decisions for choosing a master and listening or reading', cap: 'User flow.' },
        { k: 'at-sitemap', alt: 'Site map: home, five masters with five works each, and an about page', cap: 'Site map.' }
      ] },
      { h: 'Mid-fidelity wireframes', t: [
        'Grey wireframes fixed the structure before any colour: the home page with five floating frames, and story mode with its chapter list and player.'
      ], figs: [
        { k: 'at-mid-home', alt: 'Mid-fidelity home page wireframe', cap: 'Home.' },
        { k: 'at-mid-story', alt: 'Mid-fidelity story mode wireframe', cap: 'Story mode.' }
      ], cols: 2 },
      { h: 'Final design', t: [
        'Each master has a room in their era’s colour. An artwork page gives the key facts and one button: listen to the story. Fullscreen view lets you look closely, and the about page explains the idea: a museum with no walls, only stories.'
      ], figs: [
        { k: 'at-hi-room', alt: 'Johannes Vermeer’s room in dark green with his paintings', cap: 'A master’s room.' },
        { k: 'at-hi-artwork', alt: 'Artwork page for Girl with a Pearl Earring with a Listen to the story button', cap: 'Artwork page.' },
        { k: 'at-hi-fullscreen', alt: 'Girl with a Pearl Earring in fullscreen view', cap: 'Fullscreen view.' },
        { k: 'at-hi-about', alt: 'About page: a museum with no walls, only stories', cap: 'About.' }
      ], cols: 2 }
    ]
  },

  'forward-2027': {
    lead: null,
    chapters: [
      { h: 'The brief', t: [
        'Cvent asked me to design a registration website for a made-up event: Forward 2027, Ideas in Motion, a one-day conference in Chicago with a livestream.',
        'People had to be able to understand the event, choose in person or livestream, pick a ticket (Standard $299, Student $99 with ID, Livestream $79), enter their details, add dietary and accessibility needs, then review, submit and see what happens next.'
      ] },
      { h: 'What I did', list: [
        ['Research', 'studied cvent.com: colours, type, layout, buttons and animation, and noted what makes it feel like Cvent.'],
        ['Decide', 'a mobile-first website, not an app. People register once, often from an email on their phone.'],
        ['Plan the flow', 'six screens, one job each. Format comes before ticket, so nobody can pick a wrong combination.'],
        ['Design', 'a small design system, then 8 mobile screens, 4 desktop pages and a clickable prototype.']
      ] },
      { h: 'The full case study', t: [
        'Inspiration board, design system, every mobile screen with its error states, and the desktop pages.'
      ], figs: [
        { k: 'fw-1', alt: 'Forward 2027 cover and the assignment', cap: '' },
        { k: 'fw-2', alt: 'What I did, inspiration board and design system', cap: '' },
        { k: 'fw-3', alt: 'Design system components and the main mobile screens', cap: '' },
        { k: 'fw-4', alt: 'Mobile screens: details, errors, review and confirmation', cap: '' },
        { k: 'fw-5', alt: 'Desktop pages: event page, details, review and confirmation', cap: '' }
      ] }
    ]
  }
};

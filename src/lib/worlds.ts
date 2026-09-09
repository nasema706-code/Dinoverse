import type { CharacterId, WalkBeat } from "./characters";

export type WorldId = "mart" | "canopy" | "crater" | "forum";

export type Still = { src: string; alt: string; caption: string };

export type World = {
  id: WorldId;
  name: string;
  district: string;
  cinematic: string;
  map: string;
  summary: string;
  stills: Still[];
  beats: Record<CharacterId, WalkBeat[]>;
  enterLine: Record<CharacterId, string>;
};

export const WORLDS: World[] = [
  {
    id: "forum",
    name: "The Floor",
    district: "Dinoverse Financial",
    cinematic: "/life/corporate.jpg",
    map: "/worlds/forum/map.jpg",
    summary:
      "A glass HQ. Sun on the tape, city in every window, and a raptor with a coffee walking the lobby like he owns the floor. He does.",
    stills: [
      { src: "/life/corporate.jpg", alt: "Rex-type executive crossing a trading lobby with a holographic tablet", caption: "Lobby" },
      { src: "/life/finance.jpg", alt: "Boardroom briefing under a Dinoverse Financial Group hologram", caption: "The tape" },
      { src: "/life/analysis.jpg", alt: "Triceratops analyst at a glass desk of market holograms", caption: "Ops" },
      { src: "/life/office.jpg", alt: "Raptor developers at curved holographic code desks", caption: "Build" },
      { src: "/life/security.jpg", alt: "Ankylosaur security at Dinoverse Corporate check-in", caption: "Desk" },
      { src: "/life/hq.jpg", alt: "Dinoverse Global Headquarters plaza with an eVTOL on the pad", caption: "HQ" },
    ],
    enterLine: {
      rex: "This is the listing. Coffee in one hand, the tape in the other. Try not to look impressed.",
      vex: "Pretty glass. Pretty packets. I will tell you which screens are lying.",
      tria: "I packed the analysts a real lunch. Charts are not food.",
      ptera: "They parked a copter on the plaza. Finally, a lobby with a runway.",
    },
    beats: {
      rex: [
        {
          title: "Lobby open",
          body: "Rex crosses the marble with a cup and a live tablet. Ankylosaurs in navy, triceratops in chalk-stripe, the $Dinoverse ticker green. He does not hurry. The floor waits.",
        },
        {
          title: "The tape",
          body: "In the glass boardroom he walks the Q2 hologram like a meal. $DINOVERSE is not a pitch here. It is wallpaper on a city that already clocks in.",
        },
        {
          title: "Plaza lift",
          body: "Outside, the eVTOL idles at Global Headquarters. Rex nods at the pteranodon in the pilot jacket. Markets visit him. Sometimes they fly.",
        },
      ],
      vex: [
        {
          title: "Packet lobby",
          body: "Every holoscreen in the atrium is a broadcast. Vex reads visitor badges the way others read headlines. Clearance is just another port.",
        },
        {
          title: "Desk leak",
          body: "On the analyst floor a species-index chart is a minute slow. She flicks it. The true number blooms. Courtesy is a kind of exploit.",
        },
        {
          title: "Quiet rack",
          body: "Behind security, a node still signed in. She does not steal. She leaves a cleaner route for later.",
        },
      ],
      tria: [
        {
          title: "Crew lunch",
          body: "Tria finds the people staring at candles since dawn. She puts real food on a glass desk and calls it risk management.",
        },
        {
          title: "Names on badges",
          body: "She reads the visitor board like a reservation list. If the city feeds its analysts, the close still happens on a full stomach.",
        },
        {
          title: "After the open",
          body: "When the ticker cools she stays. Deals made after the close are the ones that stick.",
        },
      ],
      ptera: [
        {
          title: "Pad in the plaza",
          body: "Ptera walks the eVTOL ring first. A headquarters that lands craft on the doorstep is a headquarters she trusts.",
        },
        {
          title: "Glass weather",
          body: "She names the drafts between towers. East canyon, mean. South terrace, warm. Learn them and you never take the wrong lift.",
        },
        {
          title: "Clear for lift",
          body: "She does not need a ship. Standing here with $DINOVERSE in the bag is enough to make the skyline lean closer.",
        },
      ],
    },
  },
  {
    id: "mart",
    name: "Dino Mart",
    district: "Everyday city",
    cinematic: "/life/mart.jpg",
    map: "/worlds/mart/map.jpg",
    summary:
      "Grocery, brew, coffee, Dino Mac. The city eats, shops, and pays in $DINOVERSE between sets.",
    stills: [
      { src: "/life/mart.jpg", alt: "Dinosaurs leaving a glowing Dino Mart supermarket", caption: "Doors" },
      { src: "/life/produce.jpg", alt: "Produce aisle with holographic prices and a shopping list", caption: "Aisle" },
      { src: "/life/market.jpg", alt: "Open-air bazaar of fashion, fruit, and neural kits", caption: "Bazaar" },
      { src: "/life/brew.jpg", alt: "Dino Brew smoothie bar, fuel your evolution", caption: "Brew" },
      { src: "/life/coffee.jpg", alt: "Dinoverse Coffee Co. barista pouring a Jurassic Blend", caption: "Coffee" },
      { src: "/life/mac-street.jpg", alt: "Night street outside Dino Mac under flying cars", caption: "Mac" },
      { src: "/life/mac-counter.jpg", alt: "Dino Mac counter with a holographic combo board", caption: "Combo" },
      { src: "/life/mac-patio.jpg", alt: "Friends eating Dino Mac burgers on a rooftop at dusk", caption: "Patio" },
      { src: "/life/milkshake.jpg", alt: "Friends with shakes under a Mesozoic Shopping sign", caption: "Court" },
    ],
    enterLine: {
      rex: "Keep your elbows in. This floor belongs to people who already decided what they want.",
      vex: "Half these glyphs are decoys. The real prices live one layer under the glass.",
      tria: "Smell that? Honesty, pepper, and a blender that has seen things.",
      ptera: "Too many roofs. Fine. If the burger is good I will forgive the ceiling.",
    },
    beats: {
      rex: [
        {
          title: "Doors",
          body: "You do not enter Dino Mart. You get sized up by it. Holo-bags, weekly protein deals, an ankylosaur in a security polo. Rex reads the lights like a tape.",
        },
        {
          title: "The brew ledger",
          body: "Next door is Dino Brew, then Dinoverse Coffee Co. Rex pays in $DINOVERSE and a nod that means the stall is under protection for the hour.",
        },
        {
          title: "Mac after close",
          body: "Dino Mac is not a joke to him. A city that can list a coin and still run a combo board is a city that will last.",
        },
      ],
      vex: [
        {
          title: "Packet market",
          body: "Price tags float over kale. Vex hears every beacon. One stall's ring is lying. She taps the glass and the true number bruises through.",
        },
        {
          title: "Smoothie spoof",
          body: "Dino Brew's menu is a stack of broadcasts. She leaves the protein shakes honest and the decoys blinking.",
        },
        {
          title: "Service hatch",
          body: "Behind a cooler vent, a node still signed in. She does not steal. She leaves a cleaner route for later.",
        },
      ],
      tria: [
        {
          title: "Home floor",
          body: "Tria does not tour Dino Mart. She inspects it. A crooked organic-kale tag gets straightened. A cold pot at Brew gets a look that could restart a sun.",
        },
        {
          title: "The tasting walk",
          body: "Jurassic Blend, a Dino Burger combo, a shake under Mesozoic Shopping. Eat first. Then we talk tokenomics.",
        },
        {
          title: "Closing the circle",
          body: "At the center kiosk she shows you how a market becomes a city: people returning because someone remembered their order.",
        },
      ],
      ptera: [
        {
          title: "Grounded, not grounded",
          body: "Ptera hates indoor air. She treats the produce aisle like a canyon and the Mac patio like a runway.",
        },
        {
          title: "Imported weather",
          body: "Street market fruit in one claw, a cold brew in the other. A pilot should taste both ends of a map.",
        },
        {
          title: "Exit draft",
          body: "She finds the loading door by following the cold. Outside air hits like permission. The market can keep its roof.",
        },
      ],
    },
  },
  {
    id: "canopy",
    name: "The Mall",
    district: "Dinoverse Mega Mall",
    cinematic: "/life/mega-mall.jpg",
    map: "/worlds/canopy/map.jpg",
    summary:
      "Sunset glass, holographic bags, holo-fit mirrors. Fashion, tech, and a new collection every hour.",
    stills: [
      { src: "/life/mega-mall.jpg", alt: "Plaza in front of Dinoverse Mega Mall under flying cars", caption: "Plaza" },
      { src: "/life/mall-sunset.jpg", alt: "Friends leaving Dinoverse Mall at sunset with glowing bags", caption: "Dusk" },
      { src: "/life/athlete.jpg", alt: "Holo-fit smart mirror in a performance store", caption: "Fit" },
      { src: "/life/tech.jpg", alt: "Nexus Quantum holographic core in a tech shop", caption: "Nexus" },
    ],
    enterLine: {
      rex: "Pretty lights. Pretty neighbors. Pretty easy to forget who owns the lift.",
      vex: "This is my grid. Step where I step or the bags will tell on you.",
      tria: "People shop stacked like jars here. I brought extra bread. Obviously.",
      ptera: "At last, sky between the boards. Do not lean on the rail if you scare easily.",
    },
    beats: {
      rex: [
        {
          title: "Plaza politics",
          body: "Rex takes the Mega Mall doors on purpose. He wants to be seen. In this district, being seen is a kind of collateral.",
        },
        {
          title: "Bag inventory",
          body: "Holo-totes, a raptor kid underfoot, a new collection on the glass. He files it under why the city is worth the noise.",
        },
        {
          title: "The quiet span",
          body: "A corridor with no ads. He stops. If a mall can afford silence, someone is doing the books right.",
        },
      ],
      vex: [
        {
          title: "Mirror login",
          body: "The holo-fit booth still remembers her credentials. Ninety-eight percent match. She already knew.",
        },
        {
          title: "Nexus noise",
          body: "A Quantum 5 core is leaking location. Vex patches it without asking. Courtesy is a kind of exploit.",
        },
        {
          title: "The dark leaf",
          body: "There is always one unlit kiosk. She marks it, because unmarked dark is how cities grow teeth.",
        },
      ],
      tria: [
        {
          title: "Porch circuit",
          body: "Tria walks the food-court rail like a delivery route. A shake changes hands. Names get remembered.",
        },
        {
          title: "Bags as weather",
          body: "Paper, holo, iridescent raptor tote. She says this is the real infrastructure: things people trust the night with.",
        },
        {
          title: "Shared table",
          body: "On the plaza someone left extra stools. Tria sits. Empty seats are invitations, not leftovers.",
        },
      ],
      ptera: [
        {
          title: "Between towers",
          body: "Ptera walks the outer glass so the drop stays in view. Height is not danger. It is a compass.",
        },
        {
          title: "Wind report",
          body: "She names the drafts off the Mega Mall canopy. East vine, warm. North gap, mean.",
        },
        {
          title: "Launch glimpse",
          body: "Through a break in the signage the HQ pad glows. She smiles like someone who just saw a runway from the kitchen.",
        },
      ],
    },
  },
  {
    id: "crater",
    name: "The Arena",
    district: "Velocity League",
    cinematic: "/life/football.jpg",
    map: "/worlds/crater/map.jpg",
    summary:
      "Dino Fit, Jurassic Coliseum, the track at dusk. The city trains. Sweat, lights, a cup.",
    stills: [
      { src: "/life/gym.jpg", alt: "T-rex deadlifting at Dino Fit", caption: "Fit" },
      { src: "/life/fitness-street.jpg", alt: "Friends walking between Dino Mac and Dino Fit", caption: "Block" },
      { src: "/life/football.jpg", alt: "Night football at Jurassic Coliseum", caption: "Coliseum" },
      { src: "/life/soccer.jpg", alt: "Velocity League soccer with a holographic ball", caption: "Cup" },
      { src: "/life/tennis.jpg", alt: "Velociraptor Open on a rooftop court", caption: "Open" },
      { src: "/life/track.jpg", alt: "Dinoverse Classic 100m finals", caption: "Classic" },
      { src: "/life/trophy.jpg", alt: "Muddy celebration with a holographic cup", caption: "Win" },
    ],
    enterLine: {
      rex: "This is the other listing. Sweat, lights, a cup. Try not to look impressed.",
      vex: "Those scoreboards are loud. Pretty, but loud. I will tell you which ones are real.",
      tria: "I packed snacks for the bench. Athletes forget they have bodies.",
      ptera: "Home pad. If you listen, the stadium still remembers the first roar.",
    },
    beats: {
      rex: [
        {
          title: "The block",
          body: "Dino Mac on the left, Dino Fit on the right. Rex likes a city that can eat and lift on the same sidewalk.",
        },
        {
          title: "Coliseum tape",
          body: "At night the Raptors run a glowing ball down the Jurassic Coliseum. He calls it the cleanest market in the basin — if you can stand the noise.",
        },
        {
          title: "After the cup",
          body: "When the hologram trophy goes up he does not clap. He talks numbers again, because awe is not a strategy. Then he claps anyway.",
        },
      ],
      vex: [
        {
          title: "Board audit",
          body: "Three scoreboards. One is decorative. One is traffic. One is a handshake with a chain she will not name yet.",
        },
        {
          title: "Track noise",
          body: "The Classic clocked 10.27. She already had the split. The crowd is theater. The hash is not.",
        },
        {
          title: "The spare port",
          body: "A dark socket under the bench. Offline, or pretending. She leaves it. Some doors wait for a better hour.",
        },
      ],
      tria: [
        {
          title: "Crew lunch",
          body: "Tria finds the shade first. She feeds a lineman who has been staring at a play since dawn. The pad runs on calories too.",
        },
        {
          title: "Dust and ceremony",
          body: "She watches the 100m and does not clap. She just says, quietly, that leaving is easier when someone packed you fruit.",
        },
        {
          title: "Sideline garden",
          body: "Someone left extra stools by the tennis glass. She sits. A league that still bothers to share shade is a league she trusts.",
        },
      ],
      ptera: [
        {
          title: "Preflight body",
          body: "Ptera walks the track the way other people stretch. Wind, stone heat, the way the drones sit in the sky.",
        },
        {
          title: "The old scar",
          body: "She likes that nobody roofed the Coliseum. A civic sport should have weather.",
        },
        {
          title: "Clear for lift",
          body: "She does not need a ship to feel launched. A cup in the lights is enough to make the horizon lean closer.",
        },
      ],
    },
  },
];

export const WORLD_BY_ID: Record<WorldId, World> = {
  forum: WORLDS[0],
  mart: WORLDS[1],
  canopy: WORLDS[2],
  crater: WORLDS[3],
};

export function isWorldId(value: string | null | undefined): value is WorldId {
  return value === "mart" || value === "canopy" || value === "crater" || value === "forum";
}

/** Forum has a live 3D look. Other districts are plates only. */
export function isDistrictOpen(id: WorldId): id is "forum" {
  return id === "forum";
}

/** First-person walking. The Floor is open; other districts stay plates. */
export function isDistrictWalkable(id: WorldId): boolean {
  return id === "forum";
}

export const FLOOR_PREVIEW_LINE: Record<CharacterId, string> = {
  rex: "You can look. You cannot clock in yet. Orbit the glass, then come back when the doors actually open.",
  vex: "Pretty atrium. Dead access. I do not walk a lobby that is still a preview render.",
  tria: "They have not set the lunch tables. Look from the plaza. Eat later.",
  ptera: "Nice pad. No clearance. I will fly it when the tower is finished, not when it is a postcard.",
};

export const CONSTRUCTION_LINE: Record<Exclude<WorldId, "forum">, Record<CharacterId, string>> = {
  mart: {
    rex: "Dino Mart is still pouring the slab. The plates are live. The walk is not. Come back when the kale tags are honest.",
    vex: "Pretty doors. Dead uplink. I am not walking a market that is not finished spoofing its prices.",
    tria: "They have not stocked the pots. I do not tour an empty stall. Eat first — later.",
    ptera: "Too many roofs, and they are still hanging them. I will wait for the patio.",
  },
  canopy: {
    rex: "The Mega Mall is a pretty promise. The lift is not certified. We list rooms that exist.",
    vex: "The holo-fit booth is still a jpeg. I do not log into scaffolding.",
    tria: "No bread court yet. I brought extra anyway. We wait.",
    ptera: "They have not cut the sky into the glass. A mall without a drop is just a hallway.",
  },
  crater: {
    rex: "The Arena is still chalking the lines. Sweat later. The Floor is the listing today.",
    vex: "Those scoreboards are props. I will tell you which ones are real when they are actually on.",
    tria: "I packed snacks for a bench that is not built. Patience is also a meal.",
    ptera: "The Coliseum still has a roof in the plans. I do not fly a drawing.",
  },
};

export const LIFE_SCENES: Still[] = WORLDS.flatMap((w) => w.stills);

export const COLLECT_LINES: Record<CharacterId, string[]> = {
  rex: [
    "A shard with manners. Rare.",
    "That one was sitting in plain sight. Amateur hour.",
    "Bag it. Liquidity likes company.",
  ],
  vex: [
    "Unsecured glow. Cute.",
    "Logged. The chain can keep up or not.",
    "Another breadcrumb. Someone is messy on purpose.",
  ],
  tria: [
    "Warm little thing. Into the pouch.",
    "If it shines, it feeds someone later.",
    "Good find. Do not skip dinner over it.",
  ],
  ptera: [
    "Caught one. The air felt it leave.",
    "Light you can carry. That is the whole sport.",
    "Keep moving. The next one wants height.",
  ],
};

export const NPC_LINES: Record<
  string,
  { name: string; body: Record<CharacterId, string>; lines?: Record<CharacterId, string[]> }
> = {
  brak: {
    name: "Brak",
    body: {
      rex: "Floor Chief. Your usual is already poured. Try not to scare my regulars while you pretend you are browsing.",
      vex: "Visor girl. If you glitch my price ring again I am charging you in dumplings.",
      tria: "Matron. The broth is honest today. I even labeled the spicy pot. Growth.",
      ptera: "Pilot. Sit. The ceiling will not collapse. I checked. Twice, because you asked last time.",
    },
  },
  nyla: {
    name: "Nyla",
    body: {
      rex: "You always take the loud lift. Some of us are trying to nap above a mall, Chief.",
      vex: "The east kiosk blinked weird after midnight. I left it. I figured you would want the fun.",
      tria: "You brought bread. Of course you brought bread. Come sit before the wind steals it.",
      ptera: "You can see HQ from my rail. I keep meaning to visit. I keep choosing the food court.",
    },
  },
  jett: {
    name: "Jett",
    body: {
      rex: "Pad is clean, listing is noisy, bench is fed. That last one is not my department, but I notice.",
      vex: "If you are going to sniff the scoreboards, tell me which one is lying before I launch through it.",
      tria: "You can put the crate there. No, not on the coupling. Yes, I am glad to see you.",
      ptera: "Wind is mean on the north lip. You already knew. I said it anyway so the log looks thorough.",
    },
  },
  kael: {
    name: "Elder Kael",
    body: {
      rex: "Sit, Volt. The floor hears better when the loudest voice is not standing.",
      vex: "You read the glass like a terminal. Fine. Just remember some signatures here are older than keys.",
      tria: "The stools are still warm from lunch. The listing continues. So does dessert.",
      ptera: "You brought the horizon with you. Speak if you want. Or just stand there and make us look up.",
    },
  },
  rex: {
    name: "Rex Volt",
    body: {
      rex: "You already know the tape. Walk it anyway. The city clocks in whether you pose or not.",
      vex: "Headset on, visor girl. If a screen is lying I want it named before the close.",
      tria: "Coffee is honest. The tablet is not. Eat later — the Floor does not wait.",
      ptera: "Pad is yours after ten. Until then, try not to clip the lettering with a wing.",
    },
  },
  enzo: {
    name: "Enzo",
    body: {
      rex: "Plaza muscle with a blue collar. He does not clock in. He does not clock out. He just owns the pavement.",
      vex: "No badge. No packet. Still the most honest thing on this plaza. I respect a creature that does not pretend to be a terminal.",
      tria: "I brought him a snack once. He looked at me like I had offered a meeting. Fair.",
      ptera: "Wings would be wasted on him. He is already the size of a small landing. Do not taxi over the tail.",
    },
    lines: {
      rex: [
        "If he is sitting on the plaza, the listing is still standing. That is my kind of security.",
        "You can talk to the glass. He already heard you.",
      ],
      vex: [
        "I scanned the collar. It is just a collar. That is the joke.",
        "Sit still. He is better at it than half the desks upstairs.",
      ],
      tria: [
        "I am not walking him. He is walking the city. We are the ones on a leash.",
        "If Grav asks, the crumbs on the tiles are a plaza tax.",
      ],
      ptera: [
        "Crosswind does not move him. I have notes. I have envy.",
        "If the pad is full, park next to Enzo. He does not file a report.",
      ],
    },
  },
  knox: {
    name: "Knox",
    body: {
      rex: "Clearance is already on your badge, Chief. I still have to say it. Policy.",
      vex: "Bags on the scanner. Even the quiet ones. Especially the quiet ones.",
      tria: "If you brought broth through the plaza again I am logging it as a kindness, not a spill.",
      ptera: "Craft on the pad is tagged. You are tagged. Everyone is tagged. Welcome to HQ.",
    },
  },
  sela: {
    name: "Sela",
    body: {
      rex: "West doors stay open. East doors stay honest. That is the whole briefing.",
      vex: "Your visor pinged the rope. Cute. Walk between the posts like a guest.",
      tria: "Visitor chairs are inside. The plaza benches are for people who already ate.",
      ptera: "Crosswind after ten. I told Jett. I am telling you. The pad does not care who you are.",
    },
  },
  grav: {
    name: "Grav",
    body: {
      rex: "Check-in is green. The interesting names are already upstairs.",
      vex: "I see the packet before the badge. Do not make me reprint it.",
      tria: "The visitor board still has a lunch slot. I left it. Someone should use it.",
      ptera: "If you are here for the pad, take the lift or the spiral — roof deck, east. The museum wing is past the bird. Coffee is still left.",
    },
  },
  ptera: {
    name: "Ptera Drift",
    body: {
      rex: "Left seat is mine after ten. Until then I am stretching the wings, not the listing.",
      vex: "Transponder is honest. If you ping the pad I will hear it before the radio does.",
      tria: "I did not forget the sandwich. I parked it on the skid. Gravity can have the crust.",
      ptera: "You already know the crosswind. Stand here anyway. The bird looks better with a witness.",
    },
    lines: {
      rex: [
        "You walk like someone who has never been in a crosswind. I mean that kindly.",
        "The bird is fueled. I am not. Coffee first, Chief, then maybe a circuit.",
      ],
      vex: [
        "If your visor pings the transponder, wave. I already saw you. I am being polite.",
        "Keep the packet off the rotor. I like my air honest.",
      ],
      tria: [
        "I am doing laps because standing still looks like a meeting. I do not attend meetings.",
        "There is jerky in the seat pocket. Do not tell Grav it counts as lunch.",
      ],
      ptera: [
        "Same pad. Same wind. You still look like you want the left seat.",
        "If you are here to fly, wait. If you are here to talk, walk with me.",
      ],
    },
  },
  mica: {
    name: "Mica",
    body: {
      rex: "$Dinoverse is green because I made it green. Try not to give a speech on my glass.",
      vex: "Species index lagged eight seconds. I kicked it. You are welcome.",
      tria: "There is a sandwich under the keyboard. Do not tell Grav. Tell me if it is any good.",
      ptera: "The tape looks like weather from here. I would rather have your horizon.",
    },
    lines: {
      rex: [
        "If the ticker lies, I paint over it. If you lie, I still paint over it.",
        "Sit if you want. The chair already knows your weight from the last close.",
      ],
      vex: [
        "I do not debug from a standing position. That is a you problem.",
        "Your visor is prettier than my glass. My glass is honest. Pick one.",
      ],
      tria: [
        "I will trade you the sandwich for ten quiet minutes. That is the whole market.",
        "If Grav asks, the crumbs are a feature. Do not snitch on a feature.",
      ],
      ptera: [
        "I can see the pad from here. I still will not fly it. That is your whole personality.",
        "Bring weather next time. The tape is getting bored of itself.",
      ],
    },
  },
  cal: {
    name: "Cal",
    body: {
      rex: "Jurassic Blend, extra dark. I started it when the tablet cleared the doors.",
      vex: "The kettle is local-only. No uplink. That is why it tastes like a decision.",
      tria: "I used your beans. If you wanted the cheap bag you would have hidden them better.",
      ptera: "Hot enough to survive the plaza wind. Sit two minutes or lose half the cup.",
    },
    lines: {
      rex: [
        "If the open is ugly, drink it anyway. The cup does not care about the listing.",
        "I do not do oat. I do not do speeches. I do coffee.",
      ],
      vex: [
        "Your visor pinged the machine. It pinged back. We are even.",
        "Decaf is a rumor I refuse to confirm.",
      ],
      tria: [
        "I left a second cup. You always say you will not, and you always do.",
        "If Knox logs the broth, I am logging the beans. Balance.",
      ],
      ptera: [
        "Lid on. Crosswind after ten. I learned that the hard way.",
        "You can fly after this. You cannot fly hungry. Cal's rules.",
      ],
    },
  },
};

export const VISITOR_ENTER: Record<WorldId, string> = {
  forum: "Guest badge. The glass is real. Walk it — nobody is checking a costume at the door.",
  mart: "Look only. The stalls are still pouring. Come back when the pots are honest.",
  canopy: "Pretty rails. The Mall walk is not certified yet.",
  crater: "The Arena is still a plate. The wind can wait.",
};

export const VISITOR_COLLECT = [
  "Picked up. No headset required.",
  "Into the pocket. The Floor still lets guests bag a shard.",
  "Yours. The tape does not ask who you are.",
];

export const VISITOR_BUILD: Record<Exclude<WorldId, "forum">, string> = {
  mart: "Dino Mart is still pouring. Look, then come back when the stalls are honest.",
  canopy: "The Mega Mall is a pretty promise. The walk is not certified yet.",
  crater: "The Arena is still a plate. Come back when the sand is real.",
};

const VISITOR_NPC: Record<string, string> = {
  brak: "Guest. The usual is not poured because I do not know your usual. Sit anyway.",
  nyla: "You can lean on the rail. I am napping. Try not to start a listing over my head.",
  jett: "Pad is clean. You look like you walked here. That is allowed.",
  kael: "Sit if you want. The Floor hears guests too.",
  rex: "Headset, coffee, the tape. He clocks you as a guest and still makes room on the floor.",
  enzo: "Plaza muscle with a blue collar. He does not clock in. He just owns the pavement.",
  knox: "Visitor. Bags on the scanner. Policy. Then the lobby is yours.",
  sela: "West doors stay open. Walk between the posts like a guest. That is the briefing.",
  grav: "Check-in is green. Guest names go upstairs the same as the loud ones.",
  ptera: "Wind is mean after ten. You can still look at the pad. Just do not taxi over the tail.",
  mica: "If you are lost, you are on time. The Floor likes a first walk.",
  cal: "Lid on. You can fly after this. You cannot fly hungry.",
};

export function npcSpokenLine(
  id: string,
  characterId: CharacterId,
  asSelf = false,
): { name: string; body: string } | null {
  const npc = NPC_LINES[id];
  if (!npc) return null;
  if (asSelf) {
    return { name: npc.name, body: VISITOR_NPC[id] ?? `${npc.name} clocks you as a guest. The Floor is still open.` };
  }
  const extras = npc.lines?.[characterId] ?? [];
  const pool = [npc.body[characterId], ...extras];
  const body = pool[Math.floor(Math.random() * pool.length)] ?? npc.body[characterId];
  return { name: npc.name, body };
}

export function inspectSpoken(
  id: string,
  characterId: CharacterId,
  asSelf = false,
): { title: string; body: string; image?: string; href?: string; hrefLabel?: string } | null {
  const copy = INSPECT_COPY[id];
  if (!copy) return null;
  if (asSelf) {
    const verb = copy.action ? copy.action.toLowerCase() : "look";
    return {
      title: copy.title,
      body: `You ${verb}. ${copy.title} — guest eyes, same glass.`,
      image: copy.image,
      href: copy.href,
      hrefLabel: copy.hrefLabel,
    };
  }
  return {
    title: copy.title,
    body: copy.body[characterId],
    image: copy.image,
    href: copy.href,
    hrefLabel: copy.hrefLabel,
  };
}

export const INSPECT_COPY: Record<
  string,
  {
    title: string;
    action?: string;
    image?: string;
    href?: string;
    hrefLabel?: string;
    body: Record<CharacterId, string>;
  }
> = {
  "mart-kiosk": {
    title: "Stall kiosk",
    body: {
      rex: "An honest terminal. Rare. It lists kale, Jurassic Blend, and a side of 'ask Tria.'",
      vex: "Local-only node. No uplink. Someone wanted the soup prices to stay offline. Respect.",
      tria: "I wrote half these specials. The dumpling note is new. Brak is showing off.",
      ptera: "It sells wind jerky. Finally, a market that understands pilots.",
    },
  },
  "crater-console": {
    title: "Scoreboard",
    body: {
      rex: "The window is open. $DINOVERSE does not need a speech. It needs a city that already works.",
      vex: "Handshake is live. Decorative rings are not. Do not clap for the pretty one.",
      tria: "There is a note taped under the lip: 'eat first.' I did not put it there. I approve.",
      ptera: "Clear air, warm stone, a horizon with manners. This is a good hour to be found.",
    },
  },
  "canopy-rail": {
    title: "Mall rail",
    body: {
      rex: "Pretty infrastructure. I will allow it.",
      vex: "Still accepts my key. The Mall has a long memory and a short temper.",
      tria: "Warm to the touch. Someone has been leaning here, watching the plaza like a pot that might boil.",
      ptera: "A good rail tells the truth about the drop. This one does not lie.",
    },
  },
  "forum-relief": {
    title: "Ticker wall",
    action: "Read the tape",
    body: {
      rex: "Old partners. Older arguments. The city has always been a negotiation.",
      vex: "Carved minutes. Immutable, unless someone brings a chisel. Cute security model.",
      tria: "A family of long-necks sharing a bowl. Some policies do not need a vote.",
      ptera: "They carved the sky into the stone. That is how you keep a roof from happening.",
    },
  },
  "forum-reception": {
    title: "Dino-Sec reception",
    action: "Read the visitor log",
    image: "/life/security.jpg",
    body: {
      rex: "The log already has my name. It always does. The floor knows when I am in the building.",
      vex: "Visitor badges, three dead cameras, one intern still signed in. Amateur hour.",
      tria: "Someone left a lunch note under the glass. I will not name them. I will feed them.",
      ptera: "Pad is on the roof now. The desk knows. The desk does not care about weather.",
    },
  },
  "forum-window": {
    title: "North glass",
    action: "Look out",
    image: "/life/hq.jpg",
    body: {
      rex: "Headquarters plaza. The bird is on the roof pad now. If it is idling, someone important is already upstairs.",
      vex: "I can see three dishes on the opposite tower. Two are decoys. The third is rude.",
      tria: "The plaza looks hungry. That is a lot of glass and not enough benches.",
      ptera: "Wind is mean between those two towers. I would not take off from the roof pad after ten.",
    },
  },
  "forum-ticker": {
    title: "Live tape",
    action: "Read the tape",
    body: {
      rex: "$DINOVERSE is green because the city is working. Do not clap. Just keep walking.",
      vex: "The strip is 400ms behind the real book. Decorative. I like the font anyway.",
      tria: "If the tape is this loud, someone skipped lunch. I can hear it from the desk.",
      ptera: "A good tape is like a good wind report. Short, honest, slightly terrifying.",
    },
  },
  "forum-rex-desk": {
    title: "Floor Chief desk",
    action: "Inspect the desk",
    image: "/life/finance.jpg",
    body: {
      rex: "Leave the cup. The left screen is the book. The right screen is everyone else's opinion.",
      vex: "He leaves a session unlocked. On purpose. I hate how much I respect that.",
      tria: "There is a real sandwich in the drawer. I put it there. He will pretend he did not notice.",
      ptera: "The chair faces the door. The window is a spare horizon. Classic Volt.",
    },
  },
  "forum-board": {
    title: "Boardroom",
    action: "Watch the tape",
    image: "/life/finance.jpg",
    body: {
      rex: "Q2 is not a speech. It is a city that already clocks in. Sit if you want the long version.",
      vex: "Pretty hologram. The real number is on the analyst desk, two beats fresher.",
      tria: "They dimmed the lights for this. I brought fruit. Priorities.",
      ptera: "A room with one window and one screen. I know which one I trust.",
    },
  },
  "forum-heli": {
    title: "HQ helicopter",
    action: "Board the bird",
    image: "/life/hq.jpg",
    body: {
      rex: "Company ship on the roof. Walk up, hop in, take the city. Space climbs. Shift drops. E when you want the floor back.",
      vex: "Keys are in it. That is either trust or a bug. I am flying it anyway.",
      tria: "I packed a sandwich for the pilot. Turns out the pilot is us. Do not spill on the stick.",
      ptera: "Finally. Space up, Shift down, WASD to write the sky. The pad has a mean crosswind after ten. I would still take it over a taxi.",
    },
  },
  "forum-coffee": {
    title: "Eggpresso café",
    action: "Order loud",
    body: {
      rex: "Neon beans. Cal runs it like a close. Sit pink, tip lime, leave happier.",
      vex: "The menu is a mood board. I still got a cup that tastes like a decision.",
      tria: "Finally, a café that admits it loves you. I brought fruit for the egg stools.",
      ptera: "Bright enough to navigate by. Sip, then roof. That is the whole briefing.",
    },
  },
  "forum-vend": {
    title: "Feed the Pack",
    action: "Hit a machine",
    body: {
      rex: "Three machines. Zero shame. If the close is ugly, buy the loudest snack.",
      vex: "Inventory is honest. The branding is not. I respect both.",
      tria: "I stocked the middle one with real protein. The pink one is for chaos.",
      ptera: "Lunch that does not require a runway. I will allow it.",
    },
  },
  "forum-drinks": {
    title: "Sip station",
    action: "Pour something neon",
    body: {
      rex: "Three nozzles. Pick a color that matches your tape. Pink if you are lying.",
      vex: "Cold, labeled, local. The violet one pinged my visor. Rude. Delicious.",
      tria: "I put cups under every spout. Civilization is a stack of clean cups.",
      ptera: "Hydrate before the pad. Crosswind plus caffeine is a personality.",
    },
  },
  "forum-lunch": {
    title: "Lunch nest",
    action: "Claim a seat",
    body: {
      rex: "Sit. Eat. Do not pitch from a sandwich. That is how cities get weird.",
      vex: "Tables face the machines on purpose. Impulse is a feature.",
      tria: "I wiped these. If you leave crumbs, I will know your species.",
      ptera: "A nest that does not fly. Still better than eating on the skid.",
    },
  },
  "forum-stairs": {
    title: "Atrium stair",
    action: "Read the stair plaque",
    image: "/life/corporate.jpg",
    body: {
      rex: "Gold arrows up, mezzanine. Gold arrows down, lobby. The spiral is the scenic route; the lift is the close.",
      vex: "Helix, glass core, lit landings. Follow the chevrons if you get turned around. I still would.",
      tria: "I timed it. Forty-eight seconds if you do not stop for coffee. I stop for coffee.",
      ptera: "A ramp with manners. Arrows tell the truth. I would rather fly, but this will do.",
    },
  },
  "forum-lift": {
    title: "Atrium lift",
    action: "Ride the glass",
    image: "/life/corporate.jpg",
    body: {
      rex: "The spiral is for people who want to be seen. The lift is for people who have a close.",
      vex: "Glass tube, one moving floor, no packet. I still rode it. Curiosity.",
      tria: "Faster than the stairs. Worse for the calves. I will allow it before lunch.",
      ptera: "A vertical runway. Short. Clean. I will not complain.",
    },
  },
  "forum-mezz": {
    title: "Mezzanine",
    action: "Look down",
    image: "/life/corporate.jpg",
    body: {
      rex: "The Floor from above. East walkway hits the roof pad — and the Hintze Hall wing past it. If the tape is loud down there, it is already too late.",
      vex: "Good sightline on the east board. Bad sightline on whoever is stealing lunch.",
      tria: "I put plants up here so people remember to breathe. They still do not.",
      ptera: "Glass, sky, and a pad that is finally at altitude. This is the floor I wanted.",
    },
  },
  "forum-dinose": {
    title: "$Dinoverse hologram",
    action: "Read the index",
    image: "/life/corporate.jpg",
    body: {
      rex: "$Dinoverse is green. Jurassic is loud. Cretaceous is polite. That is a good morning.",
      vex: "Pretty floating numbers. The real book is 400ms fresher on the east wall.",
      tria: "If the index is this bright, someone skipped breakfast. I brought fruit.",
      ptera: "A sky of numbers. I would rather a sky of weather. Still, it is honest.",
    },
  },
  "forum-q2": {
    title: "Q2 overview",
    action: "Read the board",
    image: "/life/finance.jpg",
    body: {
      rex: "Revenue, AUM, outlook bullish. Sit if you want the long version. I already lived it.",
      vex: "A donut chart is not a proof. The 68% is a costume. The handshake is not.",
      tria: "They dimmed the lights for this. I still brought fruit. Priorities.",
      ptera: "One window. One hologram. I know which one I trust.",
    },
  },
  "forum-pad": {
    title: "Roof pad",
    action: "Inspect the pad",
    image: "/life/hq.jpg",
    body: {
      rex: "If the rim is lit, someone important is already upstairs. Or Ptera is about to be. Hintze Hall is the stone wing east of the bird.",
      vex: "Transponder honest. The gold ring is louder than the radio. Height does not fix lag.",
      tria: "A lot of roof and not enough benches. The pad does not feed anyone. The hall might.",
      ptera: "Crosswind after ten. Lift or stairs, then left seat. Or walk east into the whale hall. I would still take it over a taxi.",
    },
  },
  "forum-hintze": {
    title: "Hintze Hall",
    action: "Enter the museum",
    image: "/life/hq.jpg",
    body: {
      rex: "Natural History Museum wing on the roof. Hintze Hall, scaled to a listing we can walk. Columns, vault, whale — go in.",
      vex: "Photogrammetry of a civic nave. Someone put a cathedral next to a helipad. I respect the nerve.",
      tria: "Finally a room that admits it is for looking. If you skip the whale I will know.",
      ptera: "A hall that already has a sky inside it. I will allow a ceiling that is trying.",
    },
  },
  "forum-hq-sign": {
    title: "Headquarters mark",
    action: "Read the sign",
    image: "/life/hq.jpg",
    body: {
      rex: "The lettering still moves. Global Headquarters. The city already clocks in.",
      vex: "Gold leaf and a looped mark. The interesting part is the dishes on the opposite tower.",
      tria: "A pretty name on a sliding wall of glass. I care about the kitchen behind it.",
      ptera: "A good building tells the wind where to go. This one does.",
    },
  },
  "forum-directory": {
    title: "Lobby directory",
    action: "Read the board",
    image: "/life/hq.jpg",
    href: "/canyon",
    hrefLabel: "Enter Skull Gate Canyon",
    body: {
      rex: "Dino-Sec, The Floor, boardroom — and Skull Gate. The bone bridge is the listing they do not put on a plaque; the Bone Spire waits past it.",
      vex: "A map that admits the Mall is still pouring. The canyon link is the honest one. Bridge and spire are live.",
      tria: "Coffee is marked. Reception is marked. The kitchen is not. Skull Gate is. I will allow the bridge.",
      ptera: "Pad is on the gold ring. Skull Gate is the other runway. Cross the bone bridge. The Bone Spire does not taxi.",
    },
  },
  "forum-office": {
    title: "Build floor",
    action: "Look over the desks",
    image: "/life/office.jpg",
    body: {
      rex: "Engineering still signs their commits with a claw. I allow it.",
      vex: "Three unpatched nodes. I left a note. Courtesy.",
      tria: "They forget to eat when the build is green. The planters are not lunch.",
      ptera: "Code is another wind tunnel. I respect a clean line.",
    },
  },
  "forum-command": {
    title: "Command station",
    action: "Read the boards",
    image: "/life/corporate.jpg",
    body: {
      rex: "This is the Floor when it is working. Do not clap. Keep walking.",
      vex: "Three holos, one book, one gossip feed. I cleaned the gossip.",
      tria: "Someone has been standing here since dawn. There is soup in the kitchen.",
      ptera: "Too many candles. The plaza is right there.",
    },
  },
  "trade-1": {
    title: "Terminal 04 · Ops",
    action: "Use terminal",
    image: "/life/analysis.jpg",
    body: {
      rex: "Species index, live. If it lags, kick the glass. Politely.",
      vex: "Local book on the left. Gossip on the right. I cleaned the gossip.",
      tria: "Someone has been staring at this since dawn. There is soup in the kitchen.",
      ptera: "Too many candles. Not enough sky. I will not sit long.",
    },
  },
  "trade-2": {
    title: "Terminal 05 · The book",
    action: "Use terminal",
    image: "/life/finance.jpg",
    body: {
      rex: "This is the listing when nobody is pitching. Numbers, not folklore.",
      vex: "Handshake is live. The decorative rings are not. Do not clap.",
      tria: "A clean desk. I do not trust a clean desk after the open.",
      ptera: "The book looks like a weather map. I can fly this.",
    },
  },
  "trade-3": {
    title: "Terminal 06 · Tape",
    action: "Use terminal",
    image: "/life/analysis.jpg",
    body: {
      rex: "If it lags, kick the glass. Politely.",
      vex: "Local book on the left. Gossip on the right. I cleaned the gossip.",
      tria: "Someone has been staring at this since dawn. There is soup in the kitchen.",
      ptera: "Too many candles. Not enough sky. I will not sit long.",
    },
  },
  "trade-4": {
    title: "Terminal 07 · Species",
    action: "Use terminal",
    image: "/life/analysis.jpg",
    body: {
      rex: "Species index, live. The floor is not a zoo. It is a market.",
      vex: "The silhouette is decorative. The number is not.",
      tria: "A dinosaur on a chart is still a person who skipped lunch.",
      ptera: "I know that outline. It flies better than it sits.",
    },
  },
  "trade-5": {
    title: "Terminal 08 · Portfolio",
    action: "Use terminal",
    image: "/life/analysis.jpg",
    body: {
      rex: "74.8% is a costume until the close. Sit anyway.",
      vex: "Pretty ring. The real allocation is in the gossip feed.",
      tria: "Rings do not feed people. I do.",
      ptera: "A circle with a percentage. I prefer a horizon.",
    },
  },
  "trade-6": {
    title: "Terminal 09 · Trends",
    action: "Use terminal",
    image: "/life/analysis.jpg",
    body: {
      rex: "Bars going up is not a speech. It is the city clocking in.",
      vex: "If the bars are this clean, someone already smoothed them.",
      tria: "Clean desk, loud chart. I do not trust it after the open.",
      ptera: "Looks like weather. I can fly this.",
    },
  },
  "build-1": {
    title: "Build desk 01",
    action: "Read the commit",
    image: "/life/office.jpg",
    body: {
      rex: "claw.sign($DINOVERSE). I allow it.",
      vex: "Unpatched node. I left a note. I also left a door.",
      tria: "The mug is empty. That is a problem I can solve.",
      ptera: "A clean line in the editor is a clean line in the air.",
    },
  },
  "build-2": {
    title: "Build desk 02",
    action: "Read the commit",
    image: "/life/office.jpg",
    body: {
      rex: "They still work under plants. Fine. The listing does not care about ficus.",
      vex: "JSON that thinks it is poetry. Cute.",
      tria: "Badge on the desk means they meant to come back. I will hold lunch.",
      ptera: "Wood, glass, a little sky. Better than the pit.",
    },
  },
  "build-3": {
    title: "Build desk 03",
    action: "Read the commit",
    image: "/life/office.jpg",
    body: {
      rex: "Engineering is the quiet tape. Do not clap when it goes green.",
      vex: "book.sync(local, gossip). At least they named the threat.",
      tria: "Planters are not a salad. I said what I said.",
      ptera: "I would take this desk if it had a window that opened.",
    },
  },
  "build-4": {
    title: "Build desk 04",
    action: "Read the commit",
    image: "/life/office.jpg",
    body: {
      rex: "Four desks, one city. Keep shipping.",
      vex: "if (lag > 400) kick(glass). Finally, a comment I respect.",
      tria: "Someone watered the trough. That is the only green I trust.",
      ptera: "Code, wood, daylight. A decent hangar for a mind.",
    },
  },
};

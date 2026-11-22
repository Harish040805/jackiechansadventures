*** When Asking To Change The Game UI With CLAUDE, Backup All Your HTML, CSS, JS Codes First. Then, Upload Sample Images From JACKE CHAN'S ADVENTURES Cartoon, CLAUDE Can't Perform Effectively Without That. Careful In Changing Code!!! ***






I asked you to use the Section 13/ uncle's antique shop once in the starting but you used only Cartoon street house. For Section 13/ uncle's antique shop, use #fede6d as house color & #b31f30 as roof color. Also, if you use Cartoon street house at an interval of 10 m. After 10 m, have the mountains, trees, river background for 10 m. After that, bring the houses again. Loop them such way till the end. Always bring the trees to the front of houses.


CODE FOR Section 13/ uncle's antique shop IS GIVEN IN THE SAME FILE DOWN. SEE IT.



Jackie or shadow guards can jump & run on the roofs of the houses which are paralleogram in shape & top of the houses which are flat on the top. By pressing down arrow, they can come back to the ground.




Sun during day slowly fades before night occurs. Moon during night slowly fades before sun occurs. Small stars along with Moon in night. Don't use emojis for these 3. Match the background change correctly for sun, moon & star's arrival.

Allow Jackie to make manual attacks for on screen button as well as keyboard keys like O for punch K for kick B for block. Random objects like wood on the ground, hanging rope. If B clicked stadning near wood, the wood must block the incoming blade attacks. Normal B can block shadow guard punches, using B only standing near wood can lift wood and block all incoming blades. If Jackie jumps towards a hanging rope and uses B, he must be able to hold the hanging rope and swing to & fro until he use B again. Mechanism same like tarzan game.

Chinese Words on boards with white body red border on houses

Occational pair of walls in a random colour duality (but the 2 colors must belong to same family, i.e, #b51f30 & #561e16, #acf7fe & #3e5d70 like that). No wall must come alone. They must come in pairs, i.e, the sequence must follow 2 walls seperated by 10 meters of distance exactly & both walls must be in the same colour when occured, i.e, 2 yellow walls, both in dark yellow borders. In next occurance, 2 green walls, both in dark green borders. It can come in random like the water body that come occasionally but only in pairs. Jackie can climb on them easily, stand in between. 🥷 shouldn't be able to climb. So, Jackie must be safe from 🥷 staying in between the pair of walls. Still, 🦇 can attack him as they fly & not walk like 🥷.

Though there's pause button to pause the game, set a range of time when the players can enter co-op mode. The players can get their co-op mode ID from their individual systems i.e, one must generate the ID & other must just type it in his system which is all working fine now but, to enter the ID in player 2's system takes some duration. To avoid that, player 1 can use tiger talisman, generate an ID & just send it to player 2 & set a time to connect. The player 2 can immediately or even after some time activate tiger talisman & enter the ID in time set by player 1. He can get automatically connected on time. No difficulty faced in joining co-op mode. Until the set time starts or after the set time ends, the player 2 can't join the co-op mode. To enter again, player 1 or 2 must generate a new ID & send to the other player. The time to set must follow the format HH:MM:SS & DD/MM/YYYY to avoid confusions of connecting to previous day, month or year. User must connect only to upcoming time for the session (basic knowledge, one can connect to or wait for past).

























CSS

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
  .cv {
    width: 960px;
    height: 540px;
    position: relative;
    overflow: hidden;
  }
  .b1 {
    position: absolute;
    left: 22px;
    top: 26px;
    width: 192px;
    height: 365px;
    background: #8b98f2;
    border: 3px solid #2a2159;
  }
  .b1::before {
    content: "";
    position: absolute;
    top: 26px;
    left: -10px;
    width: 212px;
    height: 36px;
    background: #a4b0fa;
    border: 3px solid #2a2159;
  }
  .b1::after {
    content: "";
    position: absolute;
    top: 86px;
    left: 24px;
    width: 142px;
    height: 22px;
    background: #c6cefd;
    border: 3px solid #2a2159;
  }
  .b2 {
    position: absolute;
    left: 252px;
    top: 68px;
    width: 258px;
    height: 325px;
    background: #7785ec;
    border: 3px solid #2a2159;
  }
  .b3 {
    position: absolute;
    right: 84px;
    top: 24px;
    width: 118px;
    height: 355px;
    background: #6776e4;
    border-left: 3px solid #2a2159;
    border-right: 3px solid #2a2159;
  }
  .b3::before {
    content: "";
    position: absolute;
    top: 34px;
    left: 11px;
    width: 90px;
    height: 46px;
    background: repeating-linear-gradient(90deg, #98a4f6 0 8px, #2a2159 8px 11px);
    border: 3px solid #2a2159;
  }
  .tr {
    position: absolute;
    top: 48px;
    right: 262px;
    width: 0;
    height: 0;
    border-left: 25px solid transparent;
    border-right: 25px solid transparent;
    border-top: 40px solid #2a2159;
  }
  .tr::after {
    content: "";
    position: absolute;
    top: -36px;
    left: -18px;
    width: 0;
    height: 0;
    border-left: 18px solid transparent;
    border-right: 18px solid transparent;
    border-top: 28px solid #6c7aed;
  }
  .rd {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 92px;
    background: linear-gradient(180deg, #a6caf4 0%, #86b0e8 30%, #6495dc 100%);
    border-top: 3px solid #232a5c;
    z-index: 10;
  }
  .lb {
    position: absolute;
    left: -18px;
    bottom: 85px;
    width: 138px;
    height: 252px;
    background: linear-gradient(90deg, #a382c8 0%, #bf9de0 100%);
    border: 3px solid #26183d;
    z-index: 5;
  }
  .lb::before {
    content: "";
    position: absolute;
    top: -19px;
    left: -10px;
    width: 158px;
    height: 23px;
    background: #c86472;
    border: 3px solid #26183d;
    border-radius: 10px 26px 4px 4px;
  }
  .lb-w {
    position: absolute;
    top: 28px;
    left: 18px;
    width: 24px;
    height: 36px;
    background: #85c1f5;
    border: 3px solid #26183d;
    box-shadow: 36px 0 0 #85c1f5, 36px 0 0 3px #26183d;
  }
  .lb-a {
    position: absolute;
    top: 104px;
    left: -6px;
    width: 132px;
    height: 22px;
    background: repeating-linear-gradient(90deg, #d84b5a 0 18px, #f4c44e 18px 36px);
    border: 3px solid #26183d;
    transform: skewX(-16deg);
  }
  .lb-d {
    position: absolute;
    bottom: 0;
    left: 20px;
    width: 56px;
    height: 112px;
    background: #b58ee0;
    border: 3px solid #26183d;
    border-bottom: none;
  }
  .mh {
    position: absolute;
    left: 156px;
    bottom: 88px;
    width: 298px;
    height: 304px;
    background: linear-gradient(90deg, #f3a83b 0%, #f9c859 45%, #fbd66d 100%);
    border: 3px solid #3b2010;
    z-index: 6;
  }
  .mh-r1 {
    position: absolute;
    top: -22px;
    left: -25px;
    width: 342px;
    height: 26px;
    background: linear-gradient(180deg, #e0483e 0%, #b82c25 100%);
    border: 3px solid #3b2010;
    border-radius: 24px 28px 6px 6px;
  }
  .mh-r1::before {
    content: "";
    position: absolute;
    top: -12px;
    left: -6px;
    width: 26px;
    height: 16px;
    background: #e0483e;
    border: 3px solid #3b2010;
    border-bottom: none;
    border-radius: 14px 4px 0 0;
  }
  .mh-r1::after {
    content: "";
    position: absolute;
    top: -12px;
    right: -6px;
    width: 26px;
    height: 16px;
    background: #e0483e;
    border: 3px solid #3b2010;
    border-bottom: none;
    border-radius: 4px 14px 0 0;
  }
  .w2 {
    position: absolute;
    top: 32px;
    width: 24px;
    height: 54px;
    background: #7ab8f5;
    border: 3px solid #3b2010;
    box-shadow: inset 0 12px 0 #a8d5ff;
  }
  .w2::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 3px;
    background: #3b2010;
  }
  .wa { left: 46px; }
  .wb { left: 80px; }
  .wc { left: 196px; }
  .wd { left: 244px; }
  .mh-e {
    position: absolute;
    top: 126px;
    left: -19px;
    width: 332px;
    height: 24px;
    background: linear-gradient(180deg, #e0483e 0%, #b52a23 100%);
    border: 3px solid #3b2010;
    border-radius: 16px 20px 4px 4px;
    z-index: 4;
  }
  .mh-e::before {
    content: "";
    position: absolute;
    top: -10px;
    left: -4px;
    width: 22px;
    height: 14px;
    background: #e0483e;
    border: 3px solid #3b2010;
    border-bottom: none;
    border-radius: 12px 2px 0 0;
  }
  .mh-e::after {
    content: "";
    position: absolute;
    top: -10px;
    right: -4px;
    width: 22px;
    height: 14px;
    background: #e0483e;
    border: 3px solid #3b2010;
    border-bottom: none;
    border-radius: 2px 12px 0 0;
  }
  .mh-s {
    position: absolute;
    top: 160px;
    left: 62px;
    width: 122px;
    height: 16px;
    background: #87b544;
    border: 3px solid #3b2010;
    border-radius: 4px;
  }
  .mh-s::before, .mh-s::after {
    content: "";
    position: absolute;
    top: -5px;
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
  }
  .mh-s::before { left: -12px; border-right: 12px solid #87b544; }
  .mh-s::after { right: -12px; border-left: 12px solid #87b544; }
  .w1a {
    position: absolute;
    bottom: 28px;
    left: 24px;
    width: 44px;
    height: 64px;
    background: #7ab8f5;
    border: 3px solid #3b2010;
    box-shadow: inset 0 18px 0 #b3dcff;
  }
  .w1a::before {
    content: "";
    position: absolute;
    top: -12px;
    left: -8px;
    width: 54px;
    height: 14px;
    background: #e0483e;
    border: 3px solid #3b2010;
    border-radius: 8px 8px 2px 2px;
  }
  .w1b {
    position: absolute;
    bottom: 32px;
    left: 102px;
    width: 60px;
    height: 60px;
    background: #a5d4ff;
    border: 3px solid #3b2010;
    border-radius: 4px;
  }
  .w1b::before {
    content: "";
    position: absolute;
    top: 8px;
    left: 8px;
    width: 38px;
    height: 28px;
    background: #fff;
    border: 2px solid #3b2010;
  }
  .dr {
    position: absolute;
    bottom: 0;
    right: 36px;
    width: 54px;
    height: 94px;
    background: #17347a;
    border: 3px solid #3b2010;
    border-bottom: none;
    overflow: hidden;
  }
  .dr::before {
    content: "";
    position: absolute;
    top: -14px;
    left: -10px;
    width: 68px;
    height: 16px;
    background: #e0483e;
    border: 3px solid #3b2010;
    border-radius: 10px 10px 2px 2px;
  }
  .ch {
    position: absolute;
    bottom: 6px;
    left: 14px;
    width: 22px;
    height: 44px;
    background: #2b65d9;
    border: 2px solid #0b1636;
    border-radius: 8px 8px 2px 2px;
  }
  .ch::before {
    content: "";
    position: absolute;
    top: -16px;
    left: 2px;
    width: 14px;
    height: 14px;
    background: #f5b982;
    border: 2px solid #0b1636;
    border-radius: 50%;
  }
  .sh {
    position: absolute;
    left: 451px;
    bottom: 88px;
    width: 346px;
    height: 186px;
    background: linear-gradient(180deg, #fbd266 0%, #f5a93b 100%);
    border: 3px solid #3b2010;
    z-index: 5;
  }
  .sh-t {
    position: absolute;
    top: -54px;
    left: 42px;
    width: 166px;
    height: 54px;
    background: #f9c859;
    border: 3px solid #3b2010;
    border-bottom: none;
  }
  .sh-t::before {
    content: "";
    position: absolute;
    top: -18px;
    left: -14px;
    width: 188px;
    height: 20px;
    background: #e0483e;
    border: 3px solid #3b2010;
    border-radius: 16px 22px 4px 4px;
  }
  .sh-tw {
    position: absolute;
    top: 12px;
    left: 22px;
    width: 118px;
    height: 36px;
    background: #7ab8f5;
    border: 3px solid #3b2010;
    background-image: linear-gradient(90deg, transparent 48%, #3b2010 48%, #3b2010 52%, transparent 52%),
                      linear-gradient(0deg, transparent 46%, #3b2010 46%, #3b2010 54%, transparent 54%);
  }
  .sh-r {
    position: absolute;
    top: -14px;
    left: -6px;
    width: 356px;
    height: 20px;
    background: #e0483e;
    border: 3px solid #3b2010;
    border-radius: 8px 18px 4px 4px;
  }
  .sh-r::after {
    content: "";
    position: absolute;
    top: -10px;
    right: -4px;
    width: 22px;
    height: 14px;
    background: #e0483e;
    border: 3px solid #3b2010;
    border-bottom: none;
    border-radius: 2px 12px 0 0;
  }
  .sh-a {
    position: absolute;
    top: 18px;
    left: 16px;
    width: 310px;
    height: 24px;
    background: repeating-linear-gradient(90deg, #e0483e 0 22px, #fbd266 22px 44px);
    border: 3px solid #3b2010;
  }
  .sh-w1 {
    position: absolute;
    bottom: 18px;
    left: 22px;
    width: 104px;
    height: 92px;
    background: #7ab8f5;
    border: 3px solid #3b2010;
    background-image: linear-gradient(90deg, transparent 32%, #3b2010 32%, #3b2010 35%, transparent 35%, transparent 65%, #3b2010 65%, #3b2010 68%, transparent 68%),
                      linear-gradient(0deg, transparent 32%, #3b2010 32%, #3b2010 35%, transparent 35%, transparent 65%, #3b2010 65%, #3b2010 68%, transparent 68%);
  }
  .sh-w1::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 26px;
    background: repeating-linear-gradient(90deg, #f9c859 0 16px, #3b2010 16px 19px);
    border-top: 3px solid #3b2010;
  }
  .sh-d {
    position: absolute;
    bottom: 0;
    left: 142px;
    width: 58px;
    height: 110px;
    background: #8cc2f8;
    border: 3px solid #3b2010;
    border-bottom: none;
  }
  .sh-d::before {
    content: "";
    position: absolute;
    top: 10px;
    left: 8px;
    width: 36px;
    height: 44px;
    background: #d8eeff;
    border: 2px solid #3b2010;
  }
  .sh-w2 {
    position: absolute;
    bottom: 18px;
    right: 22px;
    width: 104px;
    height: 92px;
    background: #7ab8f5;
    border: 3px solid #3b2010;
    background-image: linear-gradient(90deg, transparent 32%, #3b2010 32%, #3b2010 35%, transparent 35%, transparent 65%, #3b2010 65%, #3b2010 68%, transparent 68%),
                      linear-gradient(0deg, transparent 48%, #3b2010 48%, #3b2010 52%, transparent 52%);
  }
  .rb {
    position: absolute;
    right: -20px;
    bottom: 88px;
    width: 155px;
    height: 256px;
    background: linear-gradient(180deg, #8895e8 0%, #6f7dd6 100%);
    border: 3px solid #232854;
    z-index: 4;
  }
  .rb::before {
    content: "";
    position: absolute;
    top: -42px;
    left: -18px;
    width: 190px;
    height: 44px;
    background: #5b69c4;
    border: 3px solid #232854;
    border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  }
  .rb-w {
    position: absolute;
    top: 28px;
    left: 24px;
    width: 78px;
    height: 62px;
    background: #9cc4f4;
    border: 3px solid #232854;
    background-image: linear-gradient(90deg, transparent 48%, #232854 48%, #232854 52%, transparent 52%),
                      linear-gradient(0deg, transparent 48%, #232854 48%, #232854 52%, transparent 52%);
  }
  .rb-a {
    position: absolute;
    top: 112px;
    left: -12px;
    width: 165px;
    height: 22px;
    background: #7987de;
    border: 3px solid #232854;
    transform: skewX(15deg);
  }
  .rb-d {
    position: absolute;
    bottom: 0;
    left: 26px;
    width: 72px;
    height: 102px;
    background: #8e9ce8;
    border: 3px solid #232854;
    border-bottom: none;
  }
  .lb-p { position: absolute; bottom: 12px; right: 12px; width: 30px; height: 36px; background: #d84b5a; border: 3px solid #26183d; border-radius: 4px 4px 10px 10px; }
  .lb-p::before { content: ""; position: absolute; top: -18px; left: -4px; width: 32px; height: 18px; background: #59a845; border: 3px solid #26183d; border-radius: 50% 50% 20% 20%; }
  .mh-v { position: absolute; top: 100px; left: 142px; width: 16px; height: 16px; background: #d88b28; border: 3px solid #3b2010; transform: rotate(45deg); }
  .mh-v::after { content: ""; position: absolute; top: 2px; left: 2px; width: 6px; height: 6px; border: 2px solid #3b2010; }
  .sh-sb { position: absolute; top: 16px; right: 26px; width: 14px; height: 18px; background: #fff; border: 2px solid #3b2010; box-shadow: inset 0 5px 0 #e0483e; }
  .rb-f { position: absolute; bottom: 0; left: -34px; width: 58px; height: 44px; background: repeating-linear-gradient(90deg, #98a6f2 0 12px, #232854 12px 15px); border: 3px solid #232854; border-bottom: none; z-index: 6; }
  .rb-f::before { content: ""; position: absolute; top: 8px; left: -3px; width: 58px; height: 6px; background: #98a6f2; border-top: 2px solid #232854; border-bottom: 2px solid #232854; }
  .mh-l1, .mh-l2 { position: absolute; top: 96px; width: 3px; height: 26px; background: #b8731e; }
  .mh-l1 { left: 26px; }
  .mh-l2 { right: 26px; }
  .sh-l { position: absolute; top: 52px; left: 14px; width: 314px; height: 3px; background: #d88b28; }

HTML

<body>
  <div class="cv">
    <div class="b1"></div>
    <div class="b2"></div>
    <div class="b3"></div>
    <div class="tr"></div>
    <div class="lb">
      <div class="lb-w"></div>
      <div class="lb-a"></div>
      <div class="lb-d"></div>
      <div class="lb-p"></div>
    </div>
    <div class="mh">
      <div class="mh-r1"></div>
      <div class="w2 wa"></div>
      <div class="w2 wb"></div>
      <div class="w2 wc"></div>
      <div class="w2 wd"></div>
      <div class="mh-l1"></div>
      <div class="mh-l2"></div>
      <div class="mh-v"></div>
      <div class="mh-e"></div>
      <div class="mh-s"></div>
      <div class="w1a"></div>
      <div class="w1b"></div>
      <div class="dr">
      </div>
    </div>
    <div class="sh">
      <div class="sh-t">
        <div class="sh-tw"></div>
        <div class="sh-sb"></div>
      </div>
      <div class="sh-r"></div>
      <div class="sh-a"></div>
      <div class="sh-l"></div>
      <div class="sh-w1"></div>
      <div class="sh-d"></div>
      <div class="sh-w2"></div>
    </div>
    <div class="rb">
      <div class="rb-w"></div>
      <div class="rb-a"></div>
      <div class="rb-d"></div>
      <div class="rb-f"></div>
    </div>
    <div class="rd"></div>
  </div>
</body>

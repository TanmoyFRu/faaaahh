# FAAAAAAHHH

```
   ███████╗ █████╗  █████╗  █████╗  █████╗ ██╗  ██╗██╗  ██╗██╗  ██╗
   ██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔══██╗██║  ██║██║  ██║██║  ██║
   █████╗  ███████║███████║███████║███████║███████║███████║███████║
   ██╔══╝  ██╔══██║██╔══██║██╔══██║██╔══██║██╔══██║██╔══██║██╔══██║
   ██║     ██║  ██║██║  ██║██║  ██║██║  ██║██║  ██║██║  ██║██║  ██║
   ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
```

ok so hear me out.

you know that moment when you're writing code at 3am, your eyes are bleeding, you've been staring at the same function for 2 hours, and then you see it — the red squiggly line. another error. another one. and another one.

wouldn't it be absolutely unhinged if your editor just went **FAAAAAAHHH** every time that happened?

yeah. that's what this does.

---

## what even is this

it plays the faaah meme sound every time you get an error in vs code. that's it. that's the extension.

oh and it plays "aa" on warnings because warnings deserve emotional damage too, just... gentler.

the best part? **sounds overlap.** so if you paste in some horrific code with 15 errors, you get 15 faaah's playing on top of each other like some cursed orchestra. it's genuinely the funniest thing you'll hear while debugging at 4am.

## the backstory nobody asked for

so i was sitting there right. debugging some typescript. i had like 47 errors because i renamed one interface and the entire project decided to have a breakdown.

and i thought — you know what would make this moment worse? **sound effects.**

so i built this thing in one sitting fueled by spite and instant noodles. no regrets. maybe some regrets. the overlapping feature was definitely a mistake. i'm keeping it.

## ok but what does it actually do

```
you write bad code   →  FAAAAAAHHH
you get a warning    →  aaaaaa
your build fails     →  FAAAAAAHHH
your debug crashes   →  FAAAAAAHHH
you write MORE bad   →  FAAAAAAHHH FAAAAAAHHH FAAAAAAHHH
  code at once          (yes they all play at the same time)
```

it listens to literally every error source vs code has:
- **red squiggly lines** (type errors, syntax errors, lint errors, you name it)
- **build tasks that fail** (npm run build and it exits with code 1? faaah.)
- **debug sessions that crash** (your app threw an exception and died? faaah.)
- **warnings too** (unused variable? aa. implicit any? aa.)

## install it (if you dare)

**from the marketplace:**
1. open extensions tab (`Ctrl+Shift+X`)
2. search "Faaaaaahhh"
3. install
4. immediately regret it

**from vsix:**
```
code --install-extension faaaaaahhh-0.0.1.vsix
```

## how to use

literally just write code. if your code is bad (and let's be honest), you'll hear it.

**commands** (hit `Ctrl+Shift+P`):

| command | what it does |
|---|---|
| `Faaaaaahhh: Toggle Sound On/Off` | for when you need a break from the roasting |
| `Faaaaaahhh: Test Error Sound (FAAAH)` | test it. go on. you know you want to. |
| `Faaaaaahhh: Test Warning Sound (AA)` | the softer, sadder cousin |

there's a little **FAAAH** button in your status bar (bottom right). click it to shut it up when your coworkers start giving you looks.

## settings

| setting | default | what it means |
|---|---|---|
| `faaaaaahhh.enabled` | `true` | turn the whole thing on/off. setting this to false is quitter behavior but i respect it |
| `faaaaaahhh.warningsEnabled` | `true` | warnings get the "aa" sound. disable if you only want the big faaah |
| `faaaaaahhh.cooldownMs` | `0` | time between sounds in ms. 0 means no mercy — everything overlaps. set to like 3000 if you want to stay sane |
| `faaaaaahhh.customSoundPath` | `""` | put a path to your own .wav file here. record your friend going "bruh" and put that in. i dare you |
| `faaaaaahhh.customWarningSoundPath` | `""` | same thing but for warnings |

## the overlap thing deserves its own section

so by default, cooldown is 0. that means if 5 errors appear at once:

```
error 1:  FAAAAAAHHH─────────────
error 2:    FAAAAAAHHH───────────
error 3:      FAAAAAAHHH─────────
error 4:        FAAAAAAHHH───────
error 5:          FAAAAAAHHH─────
              ^
         this is where you start laughing
         and also where your speakers start crying
```

each sound is its own process. they don't cancel each other. they stack. it's chaos and it's beautiful.

if this is too much for you (fair), set `cooldownMs` to something like 3000.

## faq

**does this work with python/rust/go/java/etc?**
if vs code can find errors in it, we will faaah at it. we don't discriminate against any language. bad code is bad code.

**my coworkers are mad at me**
click the status bar button to toggle off. or get headphones. or find coworkers with a better sense of humor.

**can i use my own sounds?**
yep. `faaaaaahhh.customSoundPath` takes any `.wav` file. some suggestions:
- your friend's disappointed sigh
- a clip of gordon ramsay saying "it's RAW"
- the windows xp error sound
- a recording of your tech lead saying "let's circle back on that"

**how do i make it stop**
`Ctrl+Shift+P` → `Faaaaaahhh: Toggle Sound On/Off`. or uninstall it. or write code that doesn't have errors (good luck with that).

**is this a joke extension?**
yes. but it works really well. so maybe the joke is on us.

**does this use AI?**
no. it's literally an if statement that goes "is there a new error? ok play the sound". not everything needs to be AI. sometimes a wav file and a dream is enough.

## works on

- **windows** — powershell plays the wav
- **mac** — afplay does the job
- **linux** — paplay or aplay, whatever you've got

## wanna contribute?

found a bug? in the extension that plays sounds when you have bugs? that's poetry.

open an issue or pr at [github.com/tanmoy-debnath/faaaaaahhh](https://github.com/tanmoy-debnath/faaaaaahhh)

## license

MIT. do whatever you want with it. fork it, mod it, add reverb to the faaah, i don't care.

---

made at 3am by someone who should've been fixing bugs instead of adding sound effects to them.

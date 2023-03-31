<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { getGivenName, getRandomText, randomIntFromInterval } from "./utils";
import "./clock.ts";
import { gsap, Expo } from "gsap";
import { Clock } from "./clock";
import { Api } from "./api";
import "vue3-lottie/dist/style.css";

const props = defineProps<{ apiKey: string }>();
const api = new Api(props.apiKey);
console.log(props.apiKey);

//const eventId = "e597c83c-8c32-4421-a199-67ed78215151";
// ^removed because I saw scans with null event?

type Entry = {
  id: string;
  text: string;
};

const clock = new Clock(new Date("2023-03-10T17:45:44.000Z"));
clock.setSpeed(1);
const checkIntervalSeconds = 2;
const queueMax = 200;
const displayMax = 10;
const queue = ref<Array<Entry>>([]);
const recentNames = ref<Array<Entry>>([]);
const totalScans = ref<number>(0);
const tweenedValues = reactive({
  totalScans: 0,
});
let lastTimeStamp = clock.now();
let eventStart = new Date(clock.now());

watch(totalScans, (n) => {
  gsap.to(tweenedValues, { duration: 0.5, totalScans: Number(n) || 0 });
});

const didPassCheckpoint = (
  checkpoint: number,
  newVal: number,
  oldVal: number
): boolean => {
  const before = Math.floor(newVal / checkpoint) * checkpoint;
  const after = Math.floor(oldVal / checkpoint) * checkpoint;
  return before != after;
};

const spawnFireworks = (x: number, y: number) => {
  const root = document.querySelector(".fireworksRoot");
  const el = document.createElement("video");
  el.autoplay;
  el.controls = false;
  const vidString = `assets/Firework${(1 + Math.random() * 9)
    .toFixed(0)
    .toString()
    .padStart(2, "0")}.${(1 + Math.random() * 2).toFixed(0)}.webm`;
  el.src = vidString;
  el.style.transform = `translate(${x}px, ${y}px)`;
  el.width = 800;
  el.className = "blur-sm absolute";
  root?.appendChild(el);
  el.play();
  el.addEventListener("ended", () => {
    el.remove();
  });
};

watch(totalScans, (n, o) => {
  const r = randomIntFromInterval;
  if (didPassCheckpoint(100, n, o)) {
    console.log("passed checkpoint 100");
    for (var x = 0; x < 5; x++) {
      spawnFireworks(r(-300, 1500), r(-300, 200));
    }
    setTimeout(() => {
      for (var x = 0; x < 15; x++) {
        spawnFireworks(r(-300, 1500), r(-300, 200));
      }
    }, 500);
    setTimeout(() => {
      for (var x = 0; x < 10; x++) {
        spawnFireworks(r(-300, 1500), r(-300, 200));
      }
    }, 1300);
  } else if (didPassCheckpoint(10, n, o)) {
    console.log("passed checkpoint 10");
    for (var x = 0; x < 3; x++) {
      spawnFireworks(r(500, 1000), r(-150, 150));
    }
  }
});

function takeFromQueue() {
  console.log(queue.value.length);
  if (queue.value.length) {
    recentNames.value.unshift(queue.value.pop()!);
    totalScans.value++;
    popAnim?.restart();
  }

  console.log(recentNames.value.map((s) => s.text));
  if (recentNames.value.length > displayMax) {
    recentNames.value = recentNames.value.slice(0, displayMax);
    console.log(recentNames.value.map((s) => s.text));
  }
}

async function correctTotalScans() {
  const total = await api.fetchCountOfScansSince(eventStart);
  if (total == null) {
    console.log("invalid value");
    return;
  } else if (total <= totalScans.value) {
    console.log("Total scans is less than what we are showing");
    return;
  } else if (total < totalScans.value + 10) {
    return;
  }
  totalScans.value = total;
}

async function updateNewScans() {
  const lastTimeStampWithMargin = new Date(lastTimeStamp.getTime() - 5000);
  const recentScans = await api.fetchScansBetween(
    lastTimeStampWithMargin,
    clock.now()
  );
  lastTimeStamp = clock.now();
  if (recentScans.data == null) {
    console.log("No new scans");
    return;
  }

  for (let scan of recentScans.data) {
    if (
      queue.value.find((s) => s.id === scan.id) ||
      recentNames.value.find((s) => s.id === scan.id)
    )
      return;
    queue.value.push({
      id: scan.id,
      text: getRandomText(getGivenName(scan.person.name)),
    });
  }

  if (queue.value.length > queueMax) {
    queue.value = queue.value.slice(-queueMax);
  }
}

let popAnim: gsap.core.Timeline | null = null;
onMounted(() => {
  popAnim = gsap
    .timeline({ repeat: 0 })
    .add("start")
    .to(
      ".counter",
      {
        ease: Expo.easeOut,
        duration: 0.1,
      },
      "start"
    )
    .to(
      ".counter",
      {
        textShadow: "0px 0px 15px #feecd0",
        color: "#feecd0",
        ease: Expo.easeOut,
        duration: 0.2,
      },
      "start"
    )
    .add("end")
    .to(
      ".counter",
      {
        ease: Expo.easeOut,
        duration: 0.5,
      },
      "end"
    )
    .to(
      ".counter",
      {
        textShadow: "0px 0px 0px #feecd0",
        color: "",
        ease: Expo.easeOut,
        duration: 0.5,
      },
      "end"
    );
});

const intervals = [
  setInterval(correctTotalScans, checkIntervalSeconds * 1000),
  setInterval(updateNewScans, checkIntervalSeconds * 1000),
  setInterval(takeFromQueue, 750),
  setInterval(() => console.log(`Clock: ${clock.now().toISOString()}`), 5000),
];
onUnmounted(() => intervals.forEach((i) => clearInterval(i)));
updateNewScans();
correctTotalScans();
</script>

<template>
  <div
    class="max-w-[100vw] max-h-[100vh] h-screen w-screen overflow-hidden p-8 flex font-[Palatino] text-[#422E1C] overflow-hidden"
    :style="`
      background: url('/assets/bg.jpg') no-repeat center center fixed;
      background-size: cover;
    `"
  >
    <div
      class="absolute w-screen h-screen top-0 left-0 overflow-hidden fireworksRoot"
    >
      <!-- <Vue3Lottie
        :ref="fireworks1"
        :animationData="fireworksJson"
        :height="600"
        :width="600"
        :loop="false"
        class="absolute w-screen h-screen left-[20%] top-[25%] blur"
      /> -->
    </div>
    <div
      class="w-[55%] px-20 pt-32 flex flex-col items-start z-10 relative font-['Work_Sans']"
    >
      <h2 class="text-[55px] w-full text-center font-bold tracking-widest">
        Velkommen til innsjekk
      </h2>

      <div
        style="clip-path: polygon(10% 0%, 100% 0, 100% 100%, 0% 100%)"
        class="w-[850px] py-8 mt-4 pr-24 pl-32 rounded-r-full bg-[#441E0D] flex flex-col items-center justify-center"
      >
        <div
          class="text-[220px] tracking-wider leading-none font-bold text-[#FEECD0] counter"
        >
          {{ totalScans.toFixed(0) }}
        </div>
      </div>
      <div
        style="clip-path: polygon(0 0, 100% 0, 90% 100%, 0 100%)"
        class="ml-52 py-14 mt-6 pl-16 pr-24 rounded-l-full bg-[#441E0D] flex flex-col items-center justify-center"
      >
        <div
          class="text-[60px] tracking-wider leading-none font-bold text-[#FEECD0]"
        >
          er registrert 🎉
        </div>
      </div>
    </div>
    <div class="w-[45%] px-20 py-24 overflow-hidden" style="perspective: 100px">
      <div
        class="h-full p-12 rounded-[50px] bg-white overflow-hidden bg-opacity-30"
      >
        <div class="flex flex-col items-center">
          <TransitionGroup name="list">
            <div
              v-for="(entry, index) in recentNames"
              :key="entry.id"
              class="item text-[40px] mb-2 flex items-center"
            >
              <div
                class="transition-transform origin-bottom ease-in-out duration-500"
                :style="{
                  opacity: (displayMax - index) / displayMax,
                  //transform: `${getTransform(index)}`,
                }"
              >
                <p class="text-center">
                  {{ entry.text }}
                </p>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.item {
  transform-origin: top;
}
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.2, 0, 0, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translate(0, -100px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  display: none;
}
</style>

<template>
  <n-button @click="showModal = true" round> {{ buttonText }} </n-button>
  <n-modal v-model:show="showModal">
    <n-card
      style="width: 600px"
      :title="title"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <template #footer>
        <div class="footer">
          <input type="file" ref="fileinput" @change="onChange" id="upload" />
          <div
            id="drop_zone"
            @drop.prevent="onDrop"
            @dragover="onDragOver"
            @click="onDropClick"
            @dragstart.prevent.stop
            @dragend.prevent.stop
            @dragover.prevent.stop
            @drop.prevent.stop="onDrop"
            @mouseout="onMouseout"
          >
            <p>{{ $t("buttons.dragdrop") }}</p>
          </div>
          <n-button
            v-for="f in filesNames"
            :key="f"
            @click="deleteFile(f)"
            class="file-button"
            >{{ f }}</n-button
          >
        </div>
      </template>
      <template #action>
        <span class="actions">
          <n-button @click="onCancel"> {{ $t("buttons.cancel") }} </n-button>
          <n-button type="primary" @click="onOK">
            {{ $t("buttons.ok") }}
          </n-button>
        </span>
      </template>
    </n-card>
  </n-modal>
</template>

<script lang="ts" setup >
import { computed, defineEmits, defineProps, ref } from "vue";
const files = ref(new Map<string, string>());
const showModal = ref(false);
const fileinput = ref<HTMLInputElement>();
const props = defineProps<{
  title: string;
  readAsDataURL?: boolean;
  single?: boolean;
  buttonText: string;
}>();
const emit = defineEmits<{
  (event: "ok", value: [string, string][]): void;
  (event: "cancel"): void;
}>();
const filesNames = computed(() => {
  return [...files.value.keys()];
});
function onChange(evt) {
  [...evt.target.files].forEach((file) => {
    readFile(file);
  });
}

function onDropClick() {
  fileinput.value.click();
}

function onDragOver(ev) {
  ev.target.classList.add("dragging");
}
function onDrop(ev: DragEvent) {
  ev.preventDefault();
  ev.target.classList.remove("dragging");
  const fileList = ev.dataTransfer?.files;
  if (!fileList) return;
  [...fileList].forEach((item, i) => {
    readFile(item);
  });
}
function onMouseout(ev) {
  ev.target.classList.remove("dragging");
}

function deleteFile(filename: string) {
  files.value.delete(filename);
}
function readFile(file) {
  const fr = new FileReader();
  if (props.readAsDataURL) {
    fr.readAsDataURL(file);
  } else {
    fr.readAsText(file);
  }
  fr.onloadend = function () {
    if (props.single) {
      files.value.clear();
    }
    files.value.set(file.name, fr.result as string);
  };
}

function onOK() {
  showModal.value = false;
  emit("ok", [...files.value.entries()]);
}
function onCancel() {
  showModal.value = false;
  emit("cancel");
}
</script>

<style>
#drop_zone {
  border: 2px dashed #ccc;
  border-radius: 20px;
  width: 280px;
  height: 120px;
  padding: 20px;
  text-align: center;
  font-size: 20px;
  cursor: pointer;
  margin: auto;
}
#drop_zone.dragging {
  border-color: #18a058;
}

#upload {
  display: none;
}
.actions {
  display: flex;
  justify-content: space-between;
}
.file-button {
  margin-top: 10px;
  margin-right: 10px;
}
.footer{
  display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
}
</style>
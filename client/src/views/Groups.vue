<template>
  <Layout :left-panel-width="0">
    <template v-slot:body>
      <div class="groups-container">
        <div class="groups-header">
          <h1>{{ $t("groups.title") }}</h1>
          <n-button type="primary" @click="showCreateModal = true">{{ $t("groups.create") }}</n-button>
        </div>

        <!-- Groups list -->
        <div v-if="groups.length === 0" class="empty-state">
          <p>{{ $t("groups.empty") }}</p>
        </div>
        <div v-else class="groups-list">
          <div
            v-for="group in groups"
            :key="group.id"
            class="group-card"
            :class="{ active: selectedGroup?.id === group.id }"
            @click="selectGroup(group)"
          >
            <div class="group-card-header">
              <strong>{{ group.name }}</strong>
              <n-tag :type="group.role === 'owner' ? 'success' : 'default'" size="small">
                {{ $t(`groups.roles.${group.role}`) }}
              </n-tag>
            </div>
            <p v-if="group.description" class="group-description">{{ group.description }}</p>
            <span class="group-meta">{{ group.members_count }} {{ $t("groups.members") }}</span>
          </div>
        </div>

        <!-- Group detail panel -->
        <div v-if="selectedGroup" class="group-detail">
          <div class="group-detail-header">
            <h2>{{ selectedGroup.name }}</h2>
            <div class="group-detail-actions">
              <n-button
                v-if="isOwner"
                size="small"
                @click="openEditModal"
              >{{ $t("groups.edit") }}</n-button>
              <n-button
                v-if="isOwner"
                size="small"
                type="error"
                @click="confirmDelete"
              >{{ $t("groups.delete") }}</n-button>
              <n-button
                v-else
                size="small"
                type="warning"
                @click="leaveGroup"
              >{{ $t("groups.leave") }}</n-button>
            </div>
          </div>

          <p v-if="selectedGroup.description" class="group-description">{{ selectedGroup.description }}</p>

          <!-- Members list -->
          <h3>{{ $t("groups.membersTitle") }}</h3>
          <div class="members-list">
            <div v-for="member in groupDetail?.members" :key="member.user_id" class="member-row">
              <span class="member-email">{{ member.email }}</span>
              <n-select
                v-if="isOwner && member.role !== 'owner'"
                :value="member.role"
                :options="roleOptions"
                size="small"
                style="width: 120px"
                @update:value="(role) => updateMemberRole(member.user_id, role)"
              />
              <n-tag v-else :type="member.role === 'owner' ? 'success' : 'default'" size="small">
                {{ $t(`groups.roles.${member.role}`) }}
              </n-tag>
              <n-button
                v-if="isOwnerOrAdmin && member.role !== 'owner'"
                size="small"
                type="error"
                @click="removeMember(member.user_id)"
              >{{ $t("groups.removeMember") }}</n-button>
            </div>
          </div>

          <!-- Add member form (owner/admin) -->
          <div v-if="isOwnerOrAdmin" class="add-member-form">
            <h3>{{ $t("groups.addMember") }}</h3>
            <div class="add-member-row">
              <n-input
                v-model:value="newMemberEmail"
                :placeholder="$t('groups.memberEmailPlaceholder')"
                style="flex: 1"
              />
              <n-select
                v-model:value="newMemberRole"
                :options="addRoleOptions"
                size="medium"
                style="width: 120px"
              />
              <n-button type="primary" @click="addMember">{{ $t("groups.add") }}</n-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create group modal -->
      <n-modal v-model:show="showCreateModal" preset="dialog" :title="$t('groups.createTitle')">
        <n-form @submit.prevent="createGroup">
          <n-form-item :label="$t('groups.name')">
            <n-input v-model:value="newGroup.name" required />
          </n-form-item>
          <n-form-item :label="$t('groups.description')">
            <n-input v-model:value="newGroup.description" type="textarea" />
          </n-form-item>
          <div style="display: flex; gap: 8px; justify-content: flex-end">
            <n-button @click="showCreateModal = false">{{ $t("buttons.cancel") }}</n-button>
            <n-button type="primary" attr-type="submit">{{ $t("buttons.create") }}</n-button>
          </div>
        </n-form>
      </n-modal>

      <!-- Edit group modal -->
      <n-modal v-model:show="showEditModal" preset="dialog" :title="$t('groups.editTitle')">
        <n-form @submit.prevent="saveGroupEdit">
          <n-form-item :label="$t('groups.name')">
            <n-input v-model:value="editGroup.name" required />
          </n-form-item>
          <n-form-item :label="$t('groups.description')">
            <n-input v-model:value="editGroup.description" type="textarea" />
          </n-form-item>
          <div style="display: flex; gap: 8px; justify-content: flex-end">
            <n-button @click="showEditModal = false">{{ $t("buttons.cancel") }}</n-button>
            <n-button type="primary" attr-type="submit">{{ $t("buttons.ok") }}</n-button>
          </div>
        </n-form>
      </n-modal>

      <!-- Delete group confirm modal -->
      <n-modal v-model:show="showDeleteModal" preset="dialog" type="error" :title="$t('groups.deleteTitle')">
        <p>{{ $t("groups.deleteConfirm", { name: selectedGroup?.name }) }}</p>
        <template #action>
          <n-button @click="showDeleteModal = false">{{ $t("buttons.cancel") }}</n-button>
          <n-button type="error" @click="doDelete">{{ $t("groups.delete") }}</n-button>
        </template>
      </n-modal>

      <!-- Leave group confirm modal -->
      <n-modal v-model:show="showLeaveModal" preset="dialog" type="warning" :title="$t('groups.leaveTitle')">
        <p>{{ $t("groups.leaveConfirm", { name: selectedGroup?.name }) }}</p>
        <template #action>
          <n-button @click="showLeaveModal = false">{{ $t("buttons.cancel") }}</n-button>
          <n-button type="warning" @click="doLeave">{{ $t("groups.leave") }}</n-button>
        </template>
      </n-modal>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { NButton, NInput, NForm, NFormItem, NModal, NTag, NSelect } from "naive-ui";
import { api } from "../api";
import Layout from "../layouts/Main.vue";
import type { GroupSummary, GroupDetail } from "database";

const { t } = useI18n();

const groups = ref<GroupSummary[]>([]);
const selectedGroup = ref<GroupSummary | null>(null);
const groupDetail = ref<GroupDetail | null>(null);
const currentUserId = ref<number | null>(null);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showLeaveModal = ref(false);
const newMemberEmail = ref("");
const newMemberRole = ref("member");

const newGroup = ref({ name: "", description: "" });
const editGroup = ref({ name: "", description: "" });

const isOwner = computed(() => selectedGroup.value?.role === "owner");
const isOwnerOrAdmin = computed(() =>
  selectedGroup.value?.role === "owner" || selectedGroup.value?.role === "admin"
);

const roleOptions = computed(() => [
  { label: t("groups.roles.admin"), value: "admin" },
  { label: t("groups.roles.member"), value: "member" },
]);

const addRoleOptions = computed(() => [
  { label: t("groups.roles.admin"), value: "admin" },
  { label: t("groups.roles.member"), value: "member" },
]);

const fetchGroups = async () => {
  const { data } = await api.remote.fetcher.get("/groups");
  groups.value = data;
};

const selectGroup = async (group: GroupSummary) => {
  selectedGroup.value = group;
  const { data } = await api.remote.fetcher.get(`/group/${group.id}`);
  groupDetail.value = data;
};

const createGroup = async () => {
  if (!newGroup.value.name) return;
  await api.remote.fetcher.post("/group", {
    name: newGroup.value.name,
    description: newGroup.value.description || undefined,
  });
  newGroup.value = { name: "", description: "" };
  showCreateModal.value = false;
  await fetchGroups();
};

const openEditModal = () => {
  if (!selectedGroup.value) return;
  editGroup.value = {
    name: selectedGroup.value.name,
    description: selectedGroup.value.description ?? "",
  };
  showEditModal.value = true;
};

const saveGroupEdit = async () => {
  if (!selectedGroup.value) return;
  await api.remote.fetcher.put(`/group/${selectedGroup.value.id}`, {
    name: editGroup.value.name,
    description: editGroup.value.description,
  });
  showEditModal.value = false;
  await fetchGroups();
  await selectGroup({ ...selectedGroup.value, name: editGroup.value.name });
};

const confirmDelete = () => {
  if (!selectedGroup.value) return;
  showDeleteModal.value = true;
};

const doDelete = async () => {
  if (!selectedGroup.value) return;
  showDeleteModal.value = false;
  await api.remote.fetcher.delete(`/group/${selectedGroup.value.id}`);
  selectedGroup.value = null;
  groupDetail.value = null;
  await fetchGroups();
};

const leaveGroup = () => {
  if (!selectedGroup.value || !currentUserId.value) return;
  showLeaveModal.value = true;
};

const doLeave = async () => {
  if (!selectedGroup.value || !currentUserId.value) return;
  showLeaveModal.value = false;
  await api.remote.fetcher.delete(`/group/${selectedGroup.value.id}/member/${currentUserId.value}`);
  selectedGroup.value = null;
  groupDetail.value = null;
  await fetchGroups();
};

const addMember = async () => {
  if (!selectedGroup.value || !newMemberEmail.value) return;
  await api.remote.fetcher.post(`/group/${selectedGroup.value.id}/member`, {
    email: newMemberEmail.value,
    role: newMemberRole.value,
  });
  newMemberEmail.value = "";
  newMemberRole.value = "member";
  await selectGroup(selectedGroup.value);
};

const removeMember = async (userId: number) => {
  if (!selectedGroup.value) return;
  await api.remote.fetcher.delete(`/group/${selectedGroup.value.id}/member/${userId}`);
  await selectGroup(selectedGroup.value);
  await fetchGroups();
};

const updateMemberRole = async (userId: number, role: string) => {
  if (!selectedGroup.value) return;
  await api.remote.fetcher.put(`/group/${selectedGroup.value.id}/member/${userId}`, { role });
  await selectGroup(selectedGroup.value);
};

onMounted(async () => {
  const { data } = await api.remote.fetcher.get("/me");
  currentUserId.value = data.id;
  await fetchGroups();
});
</script>

<style scoped>
.groups-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.groups-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.groups-header h1 {
  margin: 0;
}

.empty-state {
  color: var(--n-text-color-disabled, #999);
}

.groups-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.group-card {
  border: 1px solid var(--n-border-color, #e0e0e0);
  border-radius: 8px;
  padding: 14px 16px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.group-card:hover,
.group-card.active {
  border-color: var(--n-primary-color, #18a058);
}

.group-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.group-description {
  font-size: 13px;
  color: var(--n-text-color-3, #666);
  margin: 4px 0;
}

.group-meta {
  font-size: 12px;
  color: var(--n-text-color-3, #999);
}

.group-detail {
  border: 1px solid var(--n-border-color, #e0e0e0);
  border-radius: 8px;
  padding: 20px;
}

.group-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.group-detail-header h2 {
  margin: 0;
}

.group-detail-actions {
  display: flex;
  gap: 8px;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.member-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.member-email {
  flex: 1;
}

.add-member-form {
  border-top: 1px solid var(--n-border-color, #e0e0e0);
  padding-top: 16px;
}

.add-member-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>

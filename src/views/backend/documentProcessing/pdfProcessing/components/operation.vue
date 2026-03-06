<template>
  <div class="operation-bar">
    <div class="operation-left">
      <a-tooltip title="旋转">
        <a-button type="text" class="operation-btn" @click="handleRotate">
          <template #icon>
            <RotateRightOutlined />
          </template>
        </a-button>
      </a-tooltip>
    </div>

    <div class="operation-center">
      <a-tooltip title="框选标注">
        <a-button
          type="text"
          class="operation-btn operation-btn-center"
          @click="handleSelectRemake"
        >
          <template #icon>
            <BorderOutlined />
          </template>
          <span class="btn-text">框选标注</span>
        </a-button>
      </a-tooltip>
    </div>

    <div class="operation-right">
      <a-tooltip title="放大">
        <a-button type="text" class="operation-btn" @click="handleZoomIn">
          <template #icon>
            <ZoomInOutlined />
          </template>
        </a-button>
      </a-tooltip>
      <a-tooltip title="缩小">
        <a-button type="text" class="operation-btn" @click="handleZoomOut">
          <template #icon>
            <ZoomOutOutlined />
          </template>
        </a-button>
      </a-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  RotateRightOutlined,
  BorderOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons-vue'
import emitter from '@/utils/eventBus'

function handleZoomIn() {
  emitter.emit('zoom-in')
}

function handleZoomOut() {
  emitter.emit('zoom-out')
}

function handleRotate() {
  emitter.emit('rotate')
}

function handleSelectRemake() {
  emitter.emit('select-remake')
}
</script>

<style scoped>
.operation-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  background: var(--operation-bar-bg, #fff);
  border-bottom: 1px solid var(--operation-bar-border, #f0f0f0);
}

.operation-left {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  min-width: 0;
}

.operation-center {
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.operation-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  min-width: 0;
}

.operation-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.operation-btn-center .btn-text {
  margin-left: 4px;
  font-size: 13px;
}
</style>

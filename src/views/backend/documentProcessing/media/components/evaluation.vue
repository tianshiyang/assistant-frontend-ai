<template>
  <teleport :to="props.teleportTo">
    <div class="evaluation-box">
      <div class="title-box">请您针对本次回答打分</div>
      <div class="scope-box">
        <div
          v-for="item in Array.from({ length: 11 }, (_, i) => i)"
          :key="item"
          :class="['scope-item', { active: evaluationData.mark === item }]"
          @click="handleScopeClick(item)"
        >
          {{ item }}
        </div>
      </div>
      <div class="icon-box">
        <div class="icon-item">
          <img class="icon-img" src="@/assets/images/buyuanyi.png" />
          <div class="icon-text">非常不满意</div>
        </div>
        <div class="icon-item">
          <img class="icon-img" src="@/assets/images/yuanyi.png" />
          <div class="icon-text">非常不满意</div>
        </div>
      </div>

      <div class="sub-title-box">您还有什么建议吗？(选填)</div>
      <a-textarea
        v-model:value="evaluationData.annotation"
        class="textarea-box"
        :autosize="{ minRows: 2, maxRows: 6 }"
        :maxlength="200"
        placeholder="请输入"
      />

      <div class="bottom-box">
        <a-button class="bottom-button" shape="round" @click="handleCancel">取消</a-button>
        <a-button
          type="primary"
          :disabled="!evaluationData.mark && evaluationData.mark !== 0"
          shape="round"
          class="bottom-button"
          @click="handleConfirm"
        >
          确认
        </a-button>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import type { CreateEvaluationOptions } from './createEvaluation'
import { reactive } from 'vue'
import { message } from 'ant-design-vue'

const props = withDefaults(defineProps<CreateEvaluationOptions>(), {
  teleportTo: 'body',
  onCancel: () => {},
  onConfirm: () => {},
})

// 评分数据
const evaluationData = reactive({
  mark: null as number | null,
  annotation: '',
})

// 选择评分
const handleScopeClick = (item: number) => {
  evaluationData.mark = item
}

// 取消
const handleCancel = () => {
  props.onCancel()
}

// 确定
const handleConfirm = async () => {
  if (!evaluationData.mark && evaluationData.mark !== 0) {
    message.error('请选择评分')
    return
  }
  props.onConfirm()
}
</script>

<style scoped lang="scss">
.evaluation-box {
  padding: 28px;
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 391px;
  background: #ffffff;
  box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  z-index: 99;
  .title-box {
    height: 20px;
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 500;
    font-size: 14px;
    color: #222222;
    line-height: 20px;
    &::before {
      content: '*';
      height: 20px;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 500;
      font-size: 14px;
      color: #f6535c;
      line-height: 20px;
    }
  }
  .scope-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 12px;
    .active {
      background: #fa8919 !important;
      font-weight: 500;
      color: #ffffff !important;
      border-color: #fa8919 !important;
    }
    .scope-item {
      cursor: pointer;
      width: 24px;
      height: 24px;
      line-height: 24px;
      border-radius: 4px;
      border: 1px solid #eeeff1;
      text-align: center;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      font-size: 12px;
      color: #333333;
      &:hover {
        background: #fff9f5;
        border: 1px solid rgba(250, 125, 25, 0.32);
        font-weight: 500;
        color: #fa8919;
      }
    }
  }

  .icon-box {
    margin-top: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    .icon-item {
      display: flex;
      align-items: center;
      .icon-img {
        width: 16px;
        height: 16px;
      }
      .icon-text {
        margin-left: 6px;
        height: 12px;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        font-size: 12px;
        color: #999999;
        line-height: 12px;
      }
    }
  }
  .sub-title-box {
    margin-top: 32px;
    height: 20px;
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 500;
    font-size: 14px;
    color: #222222;
    line-height: 20px;
  }
  .textarea-box {
    margin-top: 12px;
    width: 100%;
    border: none;
    background: #f9f9f9;
    border-radius: 4px;
    padding: 12px 14px;
    font-size: 12px;
    color: #333333;
    &:focus {
      box-shadow: none;
    }
    &::placeholder {
      color: red;
      color: #999999;
      font-size: 12px;
    }
  }
  .bottom-box {
    margin-top: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    .bottom-button {
      width: 72px;
    }
  }
}

:deep(.ant-btn-primary:disabled) {
  border: none;
  color: #fff;
  background: #ebebeb;
}

:deep(textarea) {
  resize: none; /* 禁止调整大小，去掉右下角三角 */
}
</style>

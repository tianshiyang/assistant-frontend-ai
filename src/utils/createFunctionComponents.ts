import { ConfigProvider } from 'ant-design-vue'
import { render, h } from 'vue'
import type { Component } from 'vue'

export const createFunctionComponent = (component: Component, options: Record<string, any>) => {
  const container = document.createElement('div')
  document.body.appendChild(container)

  return new Promise(resolve => {
    const handleClose = () => {
      render(null, container)
      if (container.parentNode) {
        container.parentNode.removeChild(container)
      }
    }

    const vnode = h(
      ConfigProvider,
      {
        autoInsertSpaceInButton: false,
      },
      {
        default: () =>
          h(component, {
            ...options,
            onConfirm: () => {
              resolve(true)
              handleClose()
            },
            onCancel: () => {
              resolve(false)
              handleClose()
            },
          }),
      }
    )

    render(vnode, container)
  })
}

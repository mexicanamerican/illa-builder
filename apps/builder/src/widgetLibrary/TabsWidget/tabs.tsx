import { FC, useEffect, useMemo, useState } from "react"
import { TabsWidgetProps, WrappedTabsProps } from "./interface"
import { applyAlignStyle, fullWidthAndFullHeightStyle } from "./style"
import { TooltipWrapper } from "@/widgetLibrary/PublicSector/TooltipWrapper"
import { TabPane, Tabs } from "@illa-design/tabs"

export const WrappedTabs: FC<WrappedTabsProps> = (props) => {
  const {
    value,
    activeKey,
    horizontalAlign,
    tabList,
    colorScheme,
    tabPosition,
    handleUpdateDsl,
    handleOnChange,
  } = props
  const [currentKey, setCurrentKey] = useState(activeKey)

  return (
    <div css={applyAlignStyle(horizontalAlign)}>
      <Tabs
        colorScheme={colorScheme}
        tabPosition={tabPosition}
        activeKey={currentKey}
        onChange={(value) => {
          setCurrentKey(value)
          new Promise((resolve) => {
            handleUpdateDsl({ currentKey: value })
            resolve(true)
          }).then(() => {
            handleOnChange?.()
          })
        }}
      >
        {tabList?.map((item) => {
          console.log(item, "TabList TabPane item")
          return (
            <TabPane
              key={item.key}
              title={item.label}
              disabled={item.disabled}
            />
          )
        })}
      </Tabs>
    </div>
  )
}

WrappedTabs.displayName = "WrappedTabs"

export const TabsWidget: FC<TabsWidgetProps> = (props) => {
  const {
    value,
    navigateContainer,
    currentKey,
    tabList,
    viewList,
    horizontalAlign,
    displayName,
    handleUpdateDsl,
    handleUpdateGlobalData,
    handleDeleteGlobalData,
    tooltipText,
    colorScheme,
    tabPosition,
  } = props

  useEffect(() => {
    handleUpdateGlobalData(displayName, {
      value,
      horizontalAlign,
      setValue: (value: string) => {
        handleUpdateDsl({ value })
      },
      clearValue: () => {
        handleUpdateDsl({ value: undefined })
      },
    })

    return () => {
      handleDeleteGlobalData(displayName)
    }
  }, [
    displayName,
    value,
    horizontalAlign,
    handleUpdateGlobalData,
    handleUpdateDsl,
    handleDeleteGlobalData,
  ])

  const list = useMemo(() => {
    if (navigateContainer) return viewList
    return tabList
  }, [navigateContainer, tabList, viewList])

  return (
    <TooltipWrapper tooltipText={tooltipText} tooltipDisabled={!tooltipText}>
      <div css={fullWidthAndFullHeightStyle}>
        <WrappedTabs
          {...props}
          tabList={list}
          value={value}
          activeKey={currentKey}
          horizontalAlign={horizontalAlign}
          colorScheme={colorScheme}
          tabPosition={tabPosition}
        />
      </div>
    </TooltipWrapper>
  )
}

TabsWidget.displayName = "TabsWidget"

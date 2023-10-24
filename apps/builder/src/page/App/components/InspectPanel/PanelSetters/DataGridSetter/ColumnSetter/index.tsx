import { isDeepEqual } from "@mui/x-data-grid/internals"
import { get } from "lodash"
import { FC, useMemo } from "react"
import { useSelector } from "react-redux"
import { v4 } from "uuid"
import { dealRawData2ArrayData } from "@/page/App/components/InspectPanel/PanelSetters/DataGridSetter/utils"
import { ColumnContainer } from "@/page/App/components/InspectPanel/PanelSetters/DragMoveComponent/ColumnContainer"
import { getExecutionResult } from "@/redux/currentApp/executionTree/executionSelector"
import { RootState } from "@/store"
import { getColumnsTypeSetter } from "@/widgetLibrary/DataGridWidget/panelConfig"
import { Column } from "../../DragMoveComponent/Column"
import { ColumnEmpty } from "../../DragMoveComponent/Empty"
import { ColumnConfig, ColumnListSetterProps } from "./interface"

function generateCalcColumnConfig(
  key: string,
  isCalc: boolean,
  randomKey: boolean,
): ColumnConfig {
  return {
    field: randomKey ? v4() : `${key}`,
    headerName: `${key}`,
    width: 170,
    isCalc: isCalc,
    description: "",
    sortable: true,
    pinnable: true,
    filterable: true,
    hideable: true,
    aggregable: true,
    groupable: true,
    resizable: true,
    columnType: "auto",
    disableReorder: false,
    headerAlign: "left",
  }
}

const ColumnSetter: FC<ColumnListSetterProps> = (props) => {
  const {
    attrName,
    handleUpdateMultiAttrDSL,
    value = [],
    widgetDisplayName,
  } = props

  const targetComponentProps = useSelector<RootState, Record<string, any>>(
    (rootState) => {
      const executionTree = getExecutionResult(rootState)
      return get(executionTree, widgetDisplayName, {})
    },
  )

  const columnVisibilityModel = get(
    targetComponentProps,
    "columnVisibilityModel",
    undefined,
  )

  const calculateColumns: ColumnConfig[] = useMemo(() => {
    const dataSourceMode = get(
      targetComponentProps,
      "dataSourceMode",
      "dynamic",
    )
    const rawData = get(
      targetComponentProps,
      dataSourceMode === "dynamic" ? "dataSourceJS" : "dataSource",
      undefined,
    )

    const arrayData: object[] = dealRawData2ArrayData(rawData)

    if (arrayData.length == 0) {
      return []
    } else {
      return Object.keys(arrayData[0]).map((key) => {
        return generateCalcColumnConfig(key, true, false)
      })
    }
  }, [targetComponentProps])

  const mixedColumns: ColumnConfig[] = useMemo(() => {
    const dealColumns = [...calculateColumns]
    let mixedColumns = value.map((item) => {
      const index = dealColumns.findIndex((column) => {
        return column.field === item.field
      })
      if (index >= 0) {
        dealColumns.splice(index, 1)
        return {
          ...item,
          isCalc: true,
        }
      } else {
        return {
          ...item,
          isCalc: false,
        }
      }
    })
    dealColumns.forEach((item) => {
      mixedColumns.push({
        ...item,
        isCalc: true,
      })
    })
    if (!isDeepEqual(mixedColumns, value)) {
      handleUpdateMultiAttrDSL?.({
        [attrName]: mixedColumns,
      })
    }
    return mixedColumns
  }, [attrName, calculateColumns, handleUpdateMultiAttrDSL, value])

  return (
    <ColumnContainer
      columnNum={mixedColumns.length}
      onClickNew={() => {
        handleUpdateMultiAttrDSL?.({
          [attrName]: [
            ...mixedColumns,
            generateCalcColumnConfig(
              `column${mixedColumns.length + 1}`,
              false,
              true,
            ),
          ],
        })
      }}
      items={mixedColumns.map((item) => item.field)}
    >
      {mixedColumns.length > 0 ? (
        mixedColumns.map((config, index) => (
          <Column
            onDelete={(id) => {
              const finalColumns = mixedColumns.filter(
                (item) => item.field !== id,
              )
              handleUpdateMultiAttrDSL?.({
                [attrName]: finalColumns,
              })
            }}
            childrenSetter={getColumnsTypeSetter(config.columnType)}
            showDelete={!config.isCalc}
            attrPath={`${attrName}.${index}`}
            widgetDisplayName={widgetDisplayName}
            key={config.field}
            id={config.field}
            label={config.headerName ?? config.field}
            visibility={columnVisibilityModel?.[config.field] ?? true}
            onVisibilityChange={(visibility) => {
              handleUpdateMultiAttrDSL?.({
                ["columnVisibilityModel"]: {
                  ...columnVisibilityModel,
                  [config.field]: visibility,
                },
              })
            }}
          />
        ))
      ) : (
        <ColumnEmpty />
      )}
    </ColumnContainer>
  )
}

ColumnSetter.displayName = "ColumnSetter"

export default ColumnSetter

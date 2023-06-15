import React, { useCallback } from 'react';
import intl from 'react-intl-universal';
import { observer } from 'mobx-react-lite';
import {  CommandBar, ICommandBarItemProps } from '@fluentui/react';
import { toJS } from 'mobx';
import { useGlobalStore } from '../../../store';
import { IVisSpecType } from '../../../interfaces';
import type { IReactVegaHandler } from '../../../components/react-vega';
import { PIVOT_KEYS } from '../../../constants';

interface OperationBarProps {
    handler: React.RefObject<IReactVegaHandler>;
}
const OperationBar: React.FC<OperationBarProps> = ({ handler }) => {
    const { megaAutoStore, commonStore, collectionStore, painterStore, editorStore, semiAutoStore } = useGlobalStore();
    const { mainViewSpec, mainViewPattern } = megaAutoStore;

    const customizeAnalysis = useCallback(() => {
        if (mainViewSpec) {
            commonStore.visualAnalysisInGraphicWalker(mainViewSpec)
        }
    }, [mainViewSpec, commonStore])

    const analysisInPainter = useCallback(() => {
        if (mainViewSpec && mainViewPattern) {
            painterStore.analysisInPainter(mainViewSpec, mainViewPattern)
        }
    }, [mainViewSpec, mainViewPattern, painterStore])

    const viewExists = !(mainViewPattern === null || mainViewSpec === null);
    let starIconName = 'FavoriteStar';
    if (viewExists) {
        const viewFields = toJS(mainViewPattern.fields);
        const viewSpec = toJS(mainViewSpec);
        if (collectionStore.collectionContains(viewFields, viewSpec, IVisSpecType.vegaSubset)) {
            starIconName = 'FavoriteStarFill'
        }
    }

    const commandProps: ICommandBarItemProps[] = [
        {
            key: 'editing',
            text: intl.get('megaAuto.commandBar.editing'),
            iconProps: { iconName: 'BarChartVerticalEdit' },
            subMenuProps: {
                items: [
                    {
                        key: 'editingInGW',
                        text: intl.get('megaAuto.commandBar.editInGW'),
                        iconProps: { iconName: 'BarChartVerticalEdit' },
                        onClick: customizeAnalysis,
                    },
                    {
                        key: 'editingInEditor',
                        text: intl.get('megaAuto.commandBar.editInEditor'),
                        iconProps: { iconName: 'Edit' },
                        onClick: () => {
                            if (mainViewPattern && mainViewSpec) {
                                editorStore.syncSpec(IVisSpecType.vegaSubset, mainViewSpec)
                                megaAutoStore.changeMainViewSpecSource()
                            }
                        }
                    }

                ]
            }
        },
        {
            key: 'painting',
            text: intl.get('megaAuto.commandBar.painting'),
            iconProps: { iconName: 'EditCreate' },
            onClick: analysisInPainter
        },
        // {
        //     key: 'associate',
        //     text: intl.get('megaAuto.commandBar.associate'),
        //     iconProps: { iconName: 'Lightbulb' },
        //     onClick: () => {
        //         megaAutoStore.getAssociatedViews(taskMode);
        //     }
        // },
        {
            key: 'analysisInSemi',
            text: intl.get('megaAuto.commandBar.associate'),
            iconProps: { iconName: 'Lightbulb' },
            onClick: () => {
                if (mainViewPattern !== null) {
                    semiAutoStore.analysisInCopilot(toJS(mainViewPattern))
                    commonStore.setAppKey(PIVOT_KEYS.semiAuto);
                }
            }
        },
        {
            key: 'star',
            text: intl.get('common.star'),
            iconProps: { iconName: starIconName },
            onClick: () => {
                if (mainViewPattern && mainViewSpec) {
                    collectionStore.toggleCollectState(toJS(mainViewPattern.fields), toJS(mainViewSpec), IVisSpecType.vegaSubset)
                }
            }
        },
        {
            key: 'constraints',
            text: intl.get('megaAuto.commandBar.constraints'),
            iconProps: { iconName: 'MultiSelect' },
            onClick: () => {
                megaAutoStore.setShowContraints(true);
            },
            disabled: true
        },
        {
            key: 'download',
            text: intl.get('megaAuto.commandBar.download'),
            iconProps: { iconName: 'Download' },
            onClick: () => {
                handler.current?.exportImage();
            },
        },
    ]

    return <div style={{ position: 'relative', zIndex: 99}}>
        <CommandBar items={commandProps} />
    </div>
}

export default observer(OperationBar);

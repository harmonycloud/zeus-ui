export interface totalDataProps {
    clusterNum: number,
    namespaceNum: number,
    totalCpu: number,
    usedCpu: number,
    totalMemory: number,
    usedMemory: number,
    cpuUsedPercent: string,
    memoryUsedPercent: string
}

export interface evevtDataProps {
    alert: string;
    alertId: string;
    capitalType: string;
    chartVersion: string;
    clusterId: string;
    content: string;
    expr: string;
    lay: string;
    level: string;
    message: string;
    name: string;
    namespace: string;
    summary: string;
    time: string;
    type: string;
}

export interface poolListItem {
    name: string;
    id: number
}

export interface operatorListProps {
    name: string;
    clusterId: string;
    clusterName: string;
    status: number
}

export interface auditListProps {
    account: string;
    moduleChDesc: string;
    childModuleChDesc: string;
    actionChDesc: string;
    actionTime: string;
    [propName]: string | number | null;
}

export interface summaryItem {
    [propName]: string;
    alerttime: string;
    num: number;
}

export interface alertSummaryProps {
    criticalList?: summaryItem[];
    criticalSum?: number;
    infoList?: summaryItem[];
    infoSum?: number;
    warningList?: summaryItem[];
    warningSum?: number;
    x?: summaryItem[];
}

export interface briefInfoProps {
    chartName: string;
    errServiceNum: number;
    serviceNum: number;
    name: string;
    imagePath: string
}
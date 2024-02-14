import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld(
'fetchRequest',
{
    auth: (username:string, password:string) => ipcRenderer.invoke('Auth', username, password),
    getFloorPlans: (Auth:string) => ipcRenderer.invoke('GetFloorPlans', Auth),
    updateFloorPlan: (Record, Auth: String, Date: string) => ipcRenderer.invoke('UpdateFloorPlan', Record, Auth, Date)
    }

)

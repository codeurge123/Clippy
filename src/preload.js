import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('api', {
    addDataToClippings: (category, title, description) => ipcRenderer.invoke('addDataToClippings', category, title, description),
    deleteDataFromClippings: (id) => ipcRenderer.invoke('deleteDataFromClippings', id),
    getAllClippings: (category) => ipcRenderer.invoke('getAllClippings', category)
});
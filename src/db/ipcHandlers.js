import {ipcMain} from 'electron';

export default function controlHandlers(db) {

    ipcMain.handle('addDataToClippings', (_, category, title, description) => {
        db.addDataToClippings(category, title, description);
    });

    ipcMain.handle('deleteDataFromClippings', (_, id) => {
        db.deleteDataFromClippings(id);
    });

    ipcMain.handle('getAllClippings', (_, category) => {
        return db.getAllClippings(category);
    });

}
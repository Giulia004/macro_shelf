import { Injectable, signal } from "@angular/core";
import { ConnectionStatus, Network } from "@capacitor/network";

@Injectable({
    providedIn:"root"
})
export class NetworkService{
    //Signal per lo stato della connessione
    isOnline = signal<boolean>(true);

    constructor() {
        this.initNetworkListener();
    }

    private async initNetworkListener() {
        //Controllo lo stato iniziale al boot
        const status = await Network.getStatus();
        this.isOnline.set(status.connected);

        //Ascolta i cambiamenti di rete (passaggio da Wi-Fi a offline)
        Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
            this.isOnline.set(status.connected);
            console.log('Stato connessione di rete: ', status.connected ? 'ONLINE' : 'OFFLINE');
        });
    }
}
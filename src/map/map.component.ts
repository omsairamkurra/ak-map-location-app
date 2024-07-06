import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit {
  private map: L.Map | undefined;

  constructor() {}

  ngOnInit(): void {
    this.initMap();
    this.addSearch();
  }

  private initMap(): void {
    this.map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    L.marker([51.505, -0.09])
      .addTo(this.map)
      .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
      .openPopup();
  }

  private addSearch(): void {
    const provider = new OpenStreetMapProvider();

    const searchControl = new L.Control({
      position: 'topright',
    });

    searchControl.onAdd = () => {
      const div = L.DomUtil.create(
        'div',
        'leaflet-bar leaflet-control leaflet-control-custom'
      );
      div.innerHTML = `
        <input type="text" id="searchBox" placeholder="Search for a location" style="width: 200px; padding: 5px;" />
        <button id="searchButton" style="padding: 5px;">Search</button>
      `;
      return div;
    };

    if (this.map) {
      searchControl.addTo(this.map);
    }

    const searchButton = L.DomUtil.get('searchButton');
    if (searchButton) {
      L.DomEvent.on(searchButton, 'click', async () => {
        const searchBox = L.DomUtil.get('searchBox') as HTMLInputElement | null;
        if (searchBox) {
          const query = searchBox.value;
          if (!query) return;

          const results = await provider.search({ query });
          if (results && results.length > 0) {
            const result = results[0];
            const latLng = L.latLng(result.y, result.x);
            if (this.map) {
              this.map.setView(latLng, 13);
              L.marker(latLng)
                .addTo(this.map)
                .bindPopup(result.label)
                .openPopup();
            }
          } else {
            alert('Location not found.');
          }
        }
      });
    }
  }
}

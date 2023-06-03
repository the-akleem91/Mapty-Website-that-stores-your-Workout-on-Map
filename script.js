'use strict';

   const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
];
    
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const btnReset = document.querySelector(".btn-reset");



class Workout{
   date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;
  constructor(coords, distance, duration) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
  }

  click() {
    this.clicks++;
  }
}


// Running Class
class Running extends Workout
{


  type = 'running';
  constructor(coords, distance, duration, cadence)
  {
    super(coords, distance, duration);
    this.cadence = cadence
    this.calPace();
    this.setDescription();
   
  }

   // prettier-ignore

  setDescription() {
      this.Description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]}`
   }
  calPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }


}


// Cycling Class

class Cycling extends Workout {

  type = "cycling";
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calPace();
    this.setDescription();
  }
  // prettier-ignore

  setDescription() {
      this.Description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]}`
   }
  calPace() {
    this.speed = this.distance / (this.duration / 60);

    return this.speed;
  }
}
let map, mapEvent;

class App {
  #map;
  #mapEvent;

  constructor() {
    this.workouts = [];
    this._getPosition();

    // Get data from local storage
    this._getLocalStorage();

    inputType.addEventListener("change", this._toggleElevetationField);
    form.addEventListener("submit", this._nowWorkout.bind(this));
    containerWorkouts.addEventListener("click", this._movToPopup.bind(this));
    btnReset.addEventListener('click' , this.reset)
    
  }

  ////////////////////////////////////
  _getPosition() {
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert("We did Not get any Location");
      }
    );
  }

  /////////////////////////////////////
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];
    console.log(latitude, longitude);

    this.#map = L.map("map").setView(coords, 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // When We Click on the Form ///
    this.#map.on('click', this._showForm.bind(this));

    // We placed here because on reload first we should want that mao should load and after that we should mark the marker on the map from the marker
      this.workouts.forEach((work) => {
        this._renderWorkOutMarker(work);
      });
  }

  _showForm(mapE) {
       this.#mapEvent = mapE;
      form.classList.remove("hidden");
      inputDistance.focus();
  }

  _hiddenForm()
  {
       // Empty the Inputs
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
      "";
    
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => form.style.display = 'grid', 1000);
    
      
  }
  _nowWorkout(e) {
    e.preventDefault();

    // Check for the Valid Input

    const isValid = (...values) => values.every((inp) => Number.isFinite(inp));
    const isPos = (...input) => input.every((inp) => inp > 0);

    // Get the data and  // Check if the data is valid
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;

    let workout;
    if (type === "running") {
      const cadence = +inputCadence.value;
      if (
        !isValid(cadence, distance, duration) ||
        !isPos((cadence, distance, duration))
      ) {
        return alert("Number Should be Positive");
      }

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    if (type === "cycling") {
      const elevation = +inputElevation.value;
      if (
        !isValid(elevation, distance, duration) ||
        !isPos(distance, duration, elevation)
      ) {
        return alert("Number Should be Positive");
      }

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

  
    // if workout cycling . create running object
    // if workout is running create running object
    
    // Clear Input fields
    
    
    // Add new Object to workOut array
    this.workouts.push(workout);

    // Render Workout on map as marker
    this._renderWorkOutMarker(workout);


    this._renderWorkOut(workout);


    // Hide form
    this._hiddenForm() 

    this._setLocalStorage();
  }

  _renderWorkOutMarker(workout)
  {
        L.marker(workout.coords)
          .addTo(this.#map)
          .bindPopup(
            L.popup({
              maxWidth: 250,
              minWidth: 100,
              autoClose: false,
              closeOnClick: false,
              className: `${workout.type}-popup`,
            })
          )
          .setPopupContent(`${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.Description}`)
          .openPopup();
    
  } 

  _renderWorkOut(workout)
  {
    let html = `
     <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.Description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
      `;
    
    if (workout.type === 'running')
    {
      html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
        `
    }

    if (workout.type === "cycling") {
      html += `
       <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
      `;
    }

    form.insertAdjacentHTML('afterend', html);
  }


  _toggleElevetationField() {
     inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
     inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _movToPopup(e)
  {
    const workoutEl = e.target.closest('.workout');
console.log(workoutEl);
    if (!workoutEl) return;
    const workout = this.workouts.find(work => work.id === workoutEl.dataset.id);
    console.log(workout);

    this.#map.setView(workout.coords, 13,
      {
        animate: true,
        pan: {
          duration: 1
        }
      });
    
    workout.click();
  }

  _setLocalStorage() {
    localStorage.setItem('workouts' , JSON.stringify(this.workouts))
  }
  _getLocalStorage() 
  {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;
    this.workouts = data;
    this.workouts.forEach(work => {
      this._renderWorkOut(work);
    })
  }
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}


 
const app = new App();
// app._getPosition();


// I am putting from Github
import Actions from "@cocreate/actions";
import Api from "@cocreate/api";

const geolocationHandlers = {
	getCurrentPosition,
	watchPosition,
	clearWatch
};

// Get Current Position
async function getCurrentPosition(action) {
	if (action.element) action.options = await Api.getData(action);

	navigator.geolocation.getCurrentPosition(
		(position) => {
			action.data = {
				geoLocation: { coords: position.coords }
			};
			Api.setData(action);
			dispatchEvent(action);
		},
		(error) => handleError(error, action),
		action.options
	);
}

// Watch Position
async function watchPosition(action) {
	if (action.element) action.options = await Api.getData(action);

	const watchId = navigator.geolocation.watchPosition(
		(position) => {
			// Use a closure to access `watchId`
			action.data = {
				geoLocation: {
					id: watchId, // Access `watchId` from outer scope
					coords: position.coords
				}
			};

			Api.setData(action);
			dispatchEvent(action);
		},
		(error) => handleError(error, action),
		action.options
	);
}

// Clear Watch
async function clearWatch(action) {
	if (action.element) action.options = await Api.getData(action);

	if (action.options.id) {
		navigator.geolocation.clearWatch(Number(action.options.id));
		dispatchEvent(action);
	}
}

// Handle Errors
function handleError(error, action) {
	if (!action.data) action.data = { error };
	else action.data.error = error;
	console.error(`Geolocation error: ${error.message}`);
	Api.setData(action);
}

function dispatchEvent(action) {
	action.element.dispatchEvent(
		new CustomEvent(action.endEvent, {
			detail: {
				data: action
			}
		})
	);
}

// Actions Integration
Actions.init([
	{
		name: "geoLocation",
		endEvent: "geolocation",
		callback(action) {
			geolocationHandlers[action.method](action);
		}
	}
]);

export default {
	getCurrentPosition,
	watchPosition,
	clearWatch
};

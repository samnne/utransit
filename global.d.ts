interface Bus {
  id: string;
  vehicle: {
    routeName: string;
    route: {
      route_color: string;
      route_id: string;
      route_name: string;
    };
    congestionLevel: string;
    currentStatus: string;
    currentStopSequence: number;
    occupancyStatus: string;
    position: {
      bearing: number;
      latitude: number;
      longitude: number;
      odometer: number;
      speed: number;
    };
    stopId: string;
    timestamp: string;
    trip: BusSchedule;
    vehicle: {
      id: string;
      label: string;
    };
  };
}
interface Stop {
  stop_id: string;
  stop_name: string;
  arrival_time: string;
  stop_sequence: number;
  stop_lat: number;
  stop_long: number;
}

interface BusSchedule {
  route_id: string;
  service_id: string;
  trip_id: string;
  trip_headsign: string;
  shape_id: string;
  block_id: string;
  direction_id: number;
  closest: Stop;
  stops: Stop[];
}

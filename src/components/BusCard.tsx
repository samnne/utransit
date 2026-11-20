import { Text, TouchableOpacity, View } from "react-native";
import { calculateMinutesToStop } from "../../utils";

interface BusCardProps {
  bus: Bus;
  location: { latitude: number; longitude: number } | null;
  onPress: (tripId: string) => void;
}

export function BusCard({ bus, location, onPress }: BusCardProps) {
  const trip = bus.vehicle.trip;
  if (!trip) return null;

  const minutes = calculateMinutesToStop(bus, location);

  return (
    <TouchableOpacity
      onPress={() => onPress(trip.trip_id)}
      className="p-4 items-center justify-between w-[393px] gap-4 flex-row"
    >
      <View className="items-start">
        <Text className="text-5xl font-black text-white">
          {trip.route_id.split("-")[0]}
        </Text>
        {trip.direction_id !== undefined && (
          <Text className="text-xs font-bold text-white/80">
            Dir {trip.direction_id}
          </Text>
        )}
      </View>

      <Text className="text-2xl truncate w-1/2 text-white line-clamp-1 font-black">
        {trip.trip_headsign}
      </Text>

      <View className="justify-center items-center">
        <Text className="text-4xl font-black text-white">
          {minutes !== undefined ? minutes : "--"}
        </Text>
        <Text className="text-xl font-black text-white">mins</Text>
      </View>
    </TouchableOpacity>
  );
}

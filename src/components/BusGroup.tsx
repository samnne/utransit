import { useMemo, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from "react-native";
import { getDirectionalBuses, RouteGroup } from "../../utils";
import { BusCard } from "./BusCard";

const { width } = Dimensions.get("window");

interface BusGroupProps {
  group: RouteGroup;
  location: { latitude: number; longitude: number } | null;
  onSelectBus: (tripId: string) => void;
}

export function BusGroup({ group, location, onSelectBus }: BusGroupProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const directionalBuses = useMemo(
    () => getDirectionalBuses(group.buses, location),
    [group.buses, location],
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollOffset / width);
    setActiveIndex(currentIndex);
  };

  if (directionalBuses.length === 0) return null;

  const backgroundColor = directionalBuses[0]?.vehicle.route.route_color
    ? `#${directionalBuses[0].vehicle.route.route_color}`
    : "#000000";

  return (
    <View className="relative items-center justify-end">
      <ScrollView
        horizontal
        pagingEnabled
        onScroll={handleScroll}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        style={{ backgroundColor }}
        className="flex-row py-2 relative"
      >
        {directionalBuses.map((gbus) => (
          <BusCard
            key={gbus.vehicle.trip?.trip_id ?? gbus.id}
            bus={gbus}
            location={location}
            onPress={onSelectBus}
          />
        ))}
      </ScrollView>

      <View className="flex-row gap-2 bottom-1 absolute">
        {directionalBuses.map((_, index) => (
          <View
            key={index}
            className={`w-2.5 h-2.5 ${
              activeIndex === index ? "bg-primary" : "bg-primary/40"
            } rounded-full`}
          />
        ))}
      </View>
    </View>
  );
}

import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { BASE_URL } from "../../constants";
import { calculateHaversineDistance, groupByRoute } from "../../utils";
import { BusGroup } from "../components/BusGroup";
import { BusModal } from "../components/BusModal";
import { Header } from "../components/Header";

export default function App() {
  const [realtime, setRealtime] = useState<Bus[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [fetchedBus, setFetchedBus] = useState<BusSchedule>();

  const groups = useMemo(
    () =>
      location
        ? groupByRoute(realtime, {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          })
        : [],
    [realtime, location],
  );

  const fetchRealTime = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/fetch`);
      const data = await response.json();
      if (!data) return;

      const dataList: Bus[] = data.entity;
      if (location) {
        const origin = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        const distTo = (b: Bus) =>
          calculateHaversineDistance(origin, {
            latitude: b.vehicle.position.latitude,
            longitude: b.vehicle.position.longitude,
          });
        dataList.sort((a, b) => distTo(a) - distTo(b));
      }
      setRealtime(dataList);
    } catch (error) {
      console.log(error);
    }
  }, [location]);

  const fetchBus = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/trips/${id}`);
      const data = await response.json();
      if (data) {
        setFetchedBus(data);
        setShowModal(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    async function getCurrentLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    }

    getCurrentLocation();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchRealTime();
    };
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [fetchRealTime]);

  const userLocation = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }
    : null;

  return (
    <View className="flex-1 items-center bg-background">
      <Header onRefresh={fetchRealTime} />

      <ScrollView className="bg-accent w-full flex-1">
        {groups.map((group) => (
          <BusGroup
            key={group.key}
            group={group}
            location={userLocation}
            onSelectBus={fetchBus}
          />
        ))}
      </ScrollView>

      <BusModal
        bus={fetchedBus}
        groupBus={location?.coords}
        setFetchedBus={setFetchedBus}
        setShowModal={setShowModal}
        showModal={showModal}
      />
    </View>
  );
}

import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { SafeAreaView as RNSAV } from "react-native-safe-area-context";

import { LocationObjectCoords } from "expo-location";
import { styled } from "nativewind";
import { calculateHaversineDistance } from "../../utils";
const SafeAreaView = styled(RNSAV);

interface BusModalProps {
  bus: BusSchedule | undefined;
  showModal: boolean;
  groupBus: LocationObjectCoords;
  setShowModal: (bool: boolean) => void;
  setFetchedBus: (bus: BusSchedule | undefined) => void;
}

export function BusModal({
  bus,
  showModal,
  groupBus,
  setShowModal,
  setFetchedBus,
}: BusModalProps) {
  if (!bus) return null;

  const handleClose = () => {
    setFetchedBus(undefined);
    setShowModal(false);
  };
  bus.stops.sort((a) => {
    return calculateHaversineDistance(
      { latitude: groupBus?.latitude, longitude: groupBus?.longitude },
      {
        latitude: a.stop_lat,
        longitude: a.stop_long,
      },
    );
  });
  return (
    <Modal
      visible={showModal}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <SafeAreaView className="flex-1 bg-background">
        <View className="p-6 bg-primary flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-black text-white">
              Route {bus.route_id.split("-")[0]}
            </Text>
            <Text className="text-lg font-bold text-white/90">
              {bus.trip_headsign}
            </Text>
            {bus.direction_id !== undefined && (
              <Text className="text-sm text-white/70">
                Direction: {bus.direction_id}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleClose}
            className="bg-accent px-4 py-2 rounded-xl"
          >
            <Text className="text-white font-bold">CLOSE</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          <Text className="text-xl font-bold mb-4 text-text">Stops</Text>
          {bus.stops?.map((stop, index) => {
            const time24 = stop.arrival_time;
            const dateObj = new Date(`1970-01-01T${time24}`);

            const time12 = dateObj.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });

            return (
              <View
                key={stop.stop_id || index}
                className="p-4 mb-2 bg-secondary/10 rounded-xl flex-row justify-between items-center"
              >
                <View className="flex-1">
                  <Text className="text-base font-bold text-text">
                    {stop.stop_sequence}. {stop.stop_name}
                  </Text>
                </View>
                {stop.arrival_time && (
                  <Text className="text-sm font-semibold text-accent">
                    {time12}
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

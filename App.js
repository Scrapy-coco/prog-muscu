import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRAM = {
  J1: [
    { name: 'Superset 1 : Développé incliné haltères', sets: 4, reps: '8-10', rest: '90s' },
    { name: 'Superset 1 : Tirage horizontal poulie prise neutre', sets: 4, reps: '8-10', rest: '90s' },
    { name: 'Superset 2 : Tractions pronation strictes', sets: 3, reps: 'max (6-10)', rest: '90s' },
    { name: 'Superset 2 : Dips (PDC ou léger lest)', sets: 3, reps: '6-10', rest: '90s' },
    { name: 'Face Pull (optionnel)', sets: 3, reps: '12-15', rest: '60s' },
    { name: 'Gainage latéral + abduction (optionnel)', sets: 3, reps: '20s / côté', rest: '30s' },
  ],
  J2: [
    { name: 'Superset 1 : RDL une jambe (haltère côté opposé)', sets: 3, reps: '8-10 / jambe', rest: '90s' },
    { name: 'Superset 1 : Développé Arnold haltères', sets: 3, reps: '8-10', rest: '90s' },
    { name: 'Élévations latérales (poulie/halts)', sets: 3, reps: '12-15', rest: '90s' },
    { name: 'Hack/Pendulum (ou Presse pieds bas/serrés)', sets: 3, reps: '6-10', rest: '90-120s' },
  ],
  J3: [
    { name: 'Tractions explosives (type muscle-up)', sets: 4, reps: '2', rest: '2min' },
    { name: 'Row unilatéral haltère (sur banc)', sets: 3, reps: '10-12 / bras', rest: '90s' },
    { name: 'Développé couché haltères', sets: 3, reps: '8-12', rest: '90s' },
    { name: 'Transitions muscle-up assistées', sets: 3, reps: '5 lentes', rest: '90s' },
    { name: 'Extensions lombaires banc 45°', sets: 3, reps: '12-15', rest: '90s' },
    { name: 'Relevés de jambes suspendu', sets: 3, reps: 'max propre', rest: '60-90s' },
    { name: 'Hollow body hold', sets: 3, reps: '20-30s', rest: '60-90s' },
  ],
  J4: [
    { name: 'Pompes classiques (descente ~3 s)', sets: 4, reps: 'max propre', rest: '90s' },
    { name: 'Pompes diamant', sets: 4, reps: 'max', rest: '90s' },
    { name: 'Pompes mains écartées', sets: 3, reps: 'max', rest: '90s' },
    { name: 'Pompes pieds surélevés', sets: 3, reps: 'max', rest: '90s' },
  ],
};

const WEEKS = [1,2,3,4,5,6,7,8];

export default function App() {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(null);
  const [performance, setPerformance] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const json = await AsyncStorage.getItem('performance');
        if (json) {
          setPerformance(JSON.parse(json));
        }
      } catch (e) { console.log(e); }
    };
    load();
  }, []);

  const saveData = async (data) => {
    try {
      await AsyncStorage.setItem('performance', JSON.stringify(data));
    } catch (e) { console.log(e); }
  };

  const updateSet = (exIndex, setIndex, field, value) => {
    setPerformance(prev => {
      const newPerf = { ...prev };
      if (!newPerf[selectedWeek]) newPerf[selectedWeek] = {};
      if (!newPerf[selectedWeek][selectedDay]) newPerf[selectedWeek][selectedDay] = {};
      if (!newPerf[selectedWeek][selectedDay][exIndex]) newPerf[selectedWeek][selectedDay][exIndex] = {};
      if (!newPerf[selectedWeek][selectedDay][exIndex][setIndex]) newPerf[selectedWeek][selectedDay][exIndex][setIndex] = { weight:'', reps:'' };
      newPerf[selectedWeek][selectedDay][exIndex][setIndex][field] = value;
      saveData(newPerf);
      return newPerf;
    });
  };

  const copyPreviousWeek = () => {
    if (selectedWeek === 1) {
      Alert.alert('Pas de semaine précédente');
      return;
    }
    const prevWeek = selectedWeek - 1;
    const prevData = performance[prevWeek]?.[selectedDay];
    if (prevData) {
      setPerformance(prev => {
        const newPerf = { ...prev };
        if (!newPerf[selectedWeek]) newPerf[selectedWeek] = {};
        newPerf[selectedWeek][selectedDay] = JSON.parse(JSON.stringify(prevData));
        saveData(newPerf);
        return newPerf;
      });
    } else {
      Alert.alert('Aucune donnée pour la semaine précédente');
    }
  };

  if (!selectedDay) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Prog Muscu</Text>
        <Text style={styles.subtitle}>Sélectionne une semaine</Text>
        <View style={styles.row}>
          {WEEKS.map(w => (
            <TouchableOpacity key={w} style={[styles.weekButton, w === selectedWeek && styles.selectedButton]} onPress={() => setSelectedWeek(w)}>
              <Text style={styles.buttonText}>S{w}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.subtitle}>Sélectionne un jour</Text>
        <View style={styles.row}>
          {Object.keys(PROGRAM).map(day => (
            <TouchableOpacity key={day} style={styles.dayButton} onPress={() => setSelectedDay(day)}>
              <Text style={styles.buttonText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }

  const exercises = PROGRAM[selectedDay];

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => setSelectedDay(null)}>
        <Text style={styles.back}>← Retour</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Semaine {selectedWeek} - {selectedDay}</Text>
      <TouchableOpacity style={styles.copyBtn} onPress={copyPreviousWeek}>
        <Text style={styles.copyText}>Copier Semaine {selectedWeek - 1}</Text>
      </TouchableOpacity>
      {exercises.map((ex, exIndex) => (
        <View key={exIndex} style={styles.card}>
          <Text style={styles.exercise}>{ex.name}</Text>
          <Text style={styles.detail}>{ex.sets} séries de {ex.reps} — Repos: {ex.rest}</Text>
          {Array.from({ length: ex.sets }).map((_, setIndex) => {
            const setData = performance[selectedWeek]?.[selectedDay]?.[exIndex]?.[setIndex] || { weight:'', reps:'' };
            return (
              <View key={setIndex} style={styles.setRow}>
                <Text style={styles.setLabel}>S{setIndex + 1}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Poids"
                  keyboardType="numeric"
                  value={setData.weight}
                  onChangeText={(val) => updateSet(exIndex, setIndex, 'weight', val)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Reps"
                  keyboardType="numeric"
                  value={setData.reps}
                  onChangeText={(val) => updateSet(exIndex, setIndex, 'reps', val)}
                />
              </View>
            );
          })}
        </View>
      ))}
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F5F5F5' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 18, fontWeight: '600', marginVertical: 10 },
  row: { flexDirection: 'row', flexWrap:'wrap', justifyContent: 'center' },
  weekButton: { backgroundColor: '#4CAF50', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, margin: 4 },
  dayButton: { backgroundColor: '#8BC34A', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, margin: 4 },
  selectedButton: { backgroundColor: '#2E7D32' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  back: { color: '#007AFF', fontSize: 16, marginBottom: 8 },
  copyBtn: { backgroundColor: '#2196F3', padding: 10, borderRadius: 8, alignItems:'center', marginBottom: 12 },
  copyText: { color: '#FFF', fontWeight: 'bold' },
  card: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 8, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  exercise: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  detail: { fontSize: 14, color: '#666', marginBottom: 8 },
  setRow: { flexDirection:'row', alignItems:'center', marginBottom: 6 },
  setLabel: { width: 28, fontWeight: 'bold' },
  input: { flex: 1, borderWidth: 1, borderColor: '#DDD', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 6, marginHorizontal: 4, backgroundColor: '#FFF' },
});

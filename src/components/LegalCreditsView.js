import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

// Full MIT License text as required by Microsoft Phi-4 Mini's license
const MIT_LICENSE_TEXT = `MIT License

Copyright (c) Microsoft Corporation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

// Attribution and privacy disclosure screen — legally required by the MIT License
const LegalCreditsView = () => (
  <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>About DayBunce AI</Text>

      <Text style={styles.sectionTitle}>Phi-4 Mini — Open-Source AI Model</Text>
      <Text style={styles.body}>
        DayBunce AI is powered by Microsoft Phi-4 Mini, a small language model
        developed by Microsoft Research. Phi-4 Mini is distributed under the MIT
        License, which permits commercial use, modification, and redistribution
        subject to the conditions below.
      </Text>

      <Text style={styles.sectionTitle}>Commercial Use &amp; Distribution</Text>
      <Text style={styles.body}>
        DayBunce bundles and distributes Phi-4 Mini (4-bit quantized) commercially
        under the terms of the MIT License. Model weights are downloaded on-demand
        after an In-App Purchase and are stored only on your device. They are never
        uploaded or shared with any third party.
      </Text>

      <Text style={styles.sectionTitle}>Privacy</Text>
      <Text style={styles.body}>
        All AI inference happens entirely on-device. Your sales data and any
        questions you ask the DayBunce Store Expert are never transmitted to
        external servers or cloud services. The AI has no internet access.
      </Text>

      <Text style={styles.sectionTitle}>Model Information</Text>
      <Text style={styles.body}>
        Model: Microsoft Phi-4 Mini (3.8B), 8-bit activations / 4-bit weights (8da4w). Bundled under the MIT License.
      </Text>

      <Text style={styles.sectionTitle}>MIT License</Text>
      <View style={styles.licenseBox}>
        <Text style={styles.licenseText}>{MIT_LICENSE_TEXT}</Text>
      </View>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8f8fc',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    marginTop: 20,
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    color: '#444',
    lineHeight: 21,
  },
  licenseBox: {
    backgroundColor: '#eee',
    borderRadius: 8,
    padding: 14,
    marginTop: 8,
  },
  licenseText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
    fontFamily: 'Courier New',
  },
});

export default LegalCreditsView;

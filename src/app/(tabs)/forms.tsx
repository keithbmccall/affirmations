import { Picker } from '@react-native-picker/picker';
import { FC, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import NamedStyles = StyleSheet.NamedStyles;
const PANTRY_ID = '595bbdd9-4763-4453-8ad0-89080ec258ab';
export const queryPantry = async (
  url = `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/testing`,
  method = 'GET',
  postItems = undefined,
) => {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    ...(postItems ? { body: JSON.stringify(postItems) } : {}),
  });
  return response.json();
};
const capitalizeFirstLetter = string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

type PantryBasket = {
  name: string;
  pin: string;
  currency: 'usd' | 'gbp' | 'peso';
};

const whichForm: 'plain' | 'rhf' =
  'rhf' ||
  //
  'plain';
export default function FormsScreen() {
  const [pantryDetails, setPantryDetails] = useState<PantryBasket>(null);
  // Form - textinput, select, checkbox, radio
  // GET, POST, PUT, DELETE
  useEffect(() => {
    const getPantry = async () => {
      try {
        const pantry = await queryPantry();
        setPantryDetails(pantry);
        console.log({
          pantry,
        });
      } catch (e) {
        console.log({ e });
      }
    };
    void getPantry();
  }, []);
  const submitHandler = (formValues: PantryBasket) => {
    console.log({
      formValues,
    });
    const updatePantry = async () => {
      try {
        const pantry = await queryPantry(undefined, 'PUT', formValues);
        console.log(pantry);
        setPantryDetails(pantry);
      } catch (e) {
        console.log({ e });
      }
    };
    void updatePantry();
  };
  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={styles.contentContainerStyle}>
        <Text style={styles.title}>
          {pantryDetails
            ? `${capitalizeFirstLetter(pantryDetails.name)} Pantry Form`
            : 'Form'}
        </Text>
        {pantryDetails &&
          (whichForm === 'rhf' ? (
            <RhfForm
              pantryDetails={pantryDetails}
              submitHandler={submitHandler}
            />
          ) : (
            <PlainForm
              pantryDetails={pantryDetails}
              submitHandler={submitHandler}
            />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}
interface FormProps {
  pantryDetails: PantryBasket;
  submitHandler: (formValues: PantryBasket) => void;
}
const PlainForm: FC<FormProps> = ({ pantryDetails, submitHandler }) => {
  const [currency, setCurrency] = useState<PantryBasket['currency']>(
    pantryDetails.currency,
  );
  const [name, setName] = useState<PantryBasket['name']>(pantryDetails.name);
  const [pin, setPin] = useState<PantryBasket['pin']>(pantryDetails.pin);

  const onSubmit = () => {
    const formValues = {
      pin,
      name,
      currency,
    };
    submitHandler(formValues);
  };
  const onChangeTextInput = (value, type) => {
    if (type === 'name') {
      setName(value);
    } else {
      setPin(value);
    }
  };

  return (
    <>
      <Text style={styles.title}>Plane Jane </Text>
      <TextInput
        placeholder="Enter basket name"
        onChangeText={value => onChangeTextInput(value, 'name')}
        style={styles.textInput}
        value={name}
      />
      <TextInput
        secureTextEntry
        onChangeText={value => onChangeTextInput(value, 'pin')}
        placeholder="Enter Pin"
        style={styles.textInput}
        value={pin}
      />
      <Text style={styles.title}>Currency</Text>
      <Picker
        style={styles.picker}
        itemStyle={styles.pickerItem}
        selectedValue={currency}
        onValueChange={value => {
          setCurrency(value);
        }}
      >
        <Picker.Item label="USD" value="usd" />
        <Picker.Item label="GBP" value="gbp" />
        <Picker.Item label="MX" value="peso" />
      </Picker>
      <TouchableOpacity onPress={onSubmit} style={styles.submit}>
        <Text style={styles.submitLabel}>Submit</Text>
      </TouchableOpacity>
    </>
  );
};

const RhfForm: FC<FormProps> = ({ pantryDetails, submitHandler }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm();

  const onSubmit = formValues => {
    submitHandler(formValues);
  };

  return (
    <>
      <Text style={styles.title}>RHF </Text>
      <Controller
        control={control}
        defaultValue={pantryDetails.name}
        name="name"
        render={({ field: { onChange, value, onBlur } }) => {
          return (
            <TextInput
              placeholder="Enter basket name"
              onChangeText={onChange}
              onBlur={onBlur}
              style={styles.textInput}
              value={value}
            />
          );
        }}
      />
      <Controller
        control={control}
        defaultValue={pantryDetails.pin}
        name="pin"
        render={({ field: { onChange, value, onBlur } }) => {
          return (
            <TextInput
              secureTextEntry
              onChangeText={onChange}
              placeholder="Enter Pin"
              style={styles.textInput}
              value={value}
            />
          );
        }}
      />
      <Text style={styles.title}>Currency</Text>
      <Controller
        control={control}
        defaultValue={pantryDetails.currency}
        name="currency"
        render={({ field: { onChange, value, onBlur } }) => {
          return (
            <Picker
              style={styles.picker}
              itemStyle={styles.pickerItem}
              selectedValue={value}
              onValueChange={value => {
                onChange(value);
              }}
            >
              <Picker.Item label="USD" value="usd" />
              <Picker.Item label="GBP" value="gbp" />
              <Picker.Item label="MX" value="peso" />
            </Picker>
          );
        }}
      />

      <TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.submit}>
        <Text style={styles.submitLabel}>Submit</Text>
      </TouchableOpacity>
    </>
  );
};

const positioning: Record<string, NamedStyles> = {
  justifyCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
};

const colors = {
  white: '#ffffff',
  black: '#000000',
  grey: '#808080',
  darkGrey: '#232425',
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.darkGrey,
  },
  picker: {
    width: '80%',
  },
  pickerItem: {
    height: 100,
    fontSize: 14,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#b8ae99',
    borderStyle: 'solid',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    color: '#000000',
    width: '80%',
    marginTop: 10,
  },
  contentContainerStyle: {
    alignItems: 'center',
    paddingHorizontal: 15,
    height: '100%',
  },
  submit: {
    height: 50,
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 10,
    width: '80%',
    ...positioning.justifyCenter,
  },
  submitLabel: { fontSize: 16 },
});

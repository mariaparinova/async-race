import carBrands from '../assets/storage/brands.ts';

export default function getRandomCarBrand() {
  return carBrands[Math.floor(Math.random() * carBrands.length)];
}

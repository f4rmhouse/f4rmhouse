import axios, { AxiosResponse } from 'axios';
import ProductType from '../components/types/ProductType';

class OCI {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 'https://api.f4rmhouse.com' : 'http://localhost:8000');
  }

  /**
   * get will get a specific product
   * @param uid 
   * @returns 
   */
  async get(uid:string): Promise<{Code: number, Message: ProductType}>{
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/store/get/product?uid=${uid}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  async getByUTI(uti:string): Promise<{Code: number, Message: ProductType}>{
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/store/get/uti/product?uti=${uti}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  async getShowcase(uti:string): Promise<string[]>{
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/store/get/product/showcase?uti=${uti}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * search will respond to a search query with the most relevant products
   * @param query 
   * @returns 
   */
  async search(query:string): Promise<ProductType[]>{
    try {
      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/store/search?query=${query}`, {query: query});
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * all will return all products (don't use this unless you know what youre doing)
   * @returns 
   */
  async all(): Promise<ProductType[]> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/products/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }
}

export default OCI;
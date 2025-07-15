import axios, { AxiosResponse } from 'axios';
import ProductType from '../components/types/ProductType';
import ReviewType from '../components/types/ReviewType';

/**
 * Store is an abstraction for multiple datastores that contain 
 * information about products such a trending products and reviews of
 * products.
 */
class Store {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 'https://api.f4rmhouse.com' : 'http://localhost:8000');
  }

  /**
   * trending will return an array of trending products
   * @returns 
   */
  async trending(): Promise<ProductType[]> {
    try {
      //const response: AxiosResponse = await axios.get(`${this.baseUrl}/store/trending`);
      const response: AxiosResponse = await axios.get(`${this.baseUrl}/store/get/recent`);
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * getReview will return all reviews connected to a product
   * @param username 
   * @param product_id 
   * @returns 
   */
  async getReviews(username: string, product_id:string): Promise<{Code:number, Reviews:ReviewType[]}> {
      try {
        const response: AxiosResponse = await axios.get(
          `${this.baseUrl}/products/reviews?product_id=${product_id}`,
          {
            headers: {"X-Username": username},
          }
        );
        return response.data;
      } catch (error) {
        console.error('Error fetching services:', error);
        throw error;
      }
  }

  async getActionAnalytics(uti: string): Promise<ReviewType[]> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/store/get/analytics?uti=${uti}`,
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  async getProduct(uti: string): Promise<{Code: number, Message: ProductType}> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/store/get/uti/product?uti=${uti}`,
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  async getEndpoint(uti: string): Promise<any> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/store/get/product/summary?uti=${uti}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  async getDefaultF4rmers(): Promise<any> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/store/get/default/f4rmers`,
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

}

export default Store;
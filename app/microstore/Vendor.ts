import axios, { AxiosResponse } from 'axios';

/**
 * Vendor is an abstraction of a developer in the f4rmhouse ecosystem. A vendor creates tools
 * that f4rmer can use. Vendors get paid when f4rmers use their products.
 */
class Vendor {
  private baseUrl: string;
  private provider: string;
  private token: string;
  private username: string;

  constructor(username: string, provider: string, token: string, baseUrl?: string) {
    this.baseUrl = baseUrl || (process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 'https://api.f4rmhouse.com' : 'http://localhost:8000');
    this.provider = provider;
    this.token = token
    this.username = username
  }

  /**
   * getKeys will get all API keys registered to this vendor
   * @returns 
   */
  async getKeys(): Promise<any> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/vendor/key/read`,
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * createKey will create a new API key for this vendor
   * @returns 
   */
  async createKey(): Promise<any> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/vendor/key/create`, {},
        {
          headers: { "Authorization": this.token, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }
    
  /**
   * deleteKey will delete an API key
   * @param partial 
   * @returns 
   */
  async deleteKey(partial:string): Promise<any> {
    try {
      const response: AxiosResponse = await axios.delete(
        `${this.baseUrl}/vendor/key/delete`,
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider, "X-Delete": partial}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * getEndpoint will get the enpoints of a tool created by this user
   * @param uti 
   * @returns 
   */
  async getEndpoint(uti:string): Promise<any> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/store/get/product/summary?uti=${uti}`,
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

}

export default Vendor;
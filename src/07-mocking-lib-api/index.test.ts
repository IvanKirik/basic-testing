import axios from 'axios';
import { THROTTLE_TIME, throttledGetDataFromApi } from './index';
import { throttle } from 'lodash';

jest.mock('axios');
jest.mock('lodash', () => ({
  throttle: jest.fn((fn) => fn),
}));

describe('throttledGetDataFromApi', () => {
  const mockAxiosCreate = axios.create as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create instance with provided base url', async () => {
    const relativePath = '/posts';

    const mockGet = jest.fn().mockResolvedValue({ data: 'mocked data' });
    mockAxiosCreate.mockReturnValue({ get: mockGet });

    await throttledGetDataFromApi(relativePath);

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'https://jsonplaceholder.typicode.com',
    });

    expect(mockGet).toHaveBeenCalledWith(relativePath);
  });

  test('should perform request to correct provided url', async () => {
    const relativePath = '/comments';

    const mockGet = jest.fn().mockResolvedValue({ data: 'mocked comments' });
    mockAxiosCreate.mockReturnValue({ get: mockGet });

    const data = await throttledGetDataFromApi(relativePath);

    expect(mockGet).toHaveBeenCalledWith(relativePath);
    expect(data).toBe('mocked comments');
  });

  test('should return response data', async () => {
    const relativePath = '/users';

    const mockResponse = { data: [{ id: 1, name: 'John Doe' }] };
    const mockGet = jest.fn().mockResolvedValue(mockResponse);
    mockAxiosCreate.mockReturnValue({ get: mockGet });

    const data = await throttledGetDataFromApi(relativePath);

    expect(data).toEqual(mockResponse.data);
  });

  test('should throttle API calls', async () => {
    const relativePath = '/posts';

    const mockGet = jest.fn().mockResolvedValue({ data: 'mocked posts' });
    mockAxiosCreate.mockReturnValue({ get: mockGet });

    await throttledGetDataFromApi(relativePath);

    expect(throttle).toHaveBeenCalledWith(expect.any(Function), THROTTLE_TIME);
  });
});

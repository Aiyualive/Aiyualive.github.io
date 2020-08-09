import numpy as np
import pandas as pd
from numpy import ndarray
from pandas import DataFrame
from scipy.cluster.hierarchy import linkage
from scipy.sparse import csr_matrix
from scipy.spatial.distance import squareform

def ComputeCooccurrence(k: int) -> DataFrame:
	data = pd.read_csv('QueriedData.csv', dtype='category').drop_duplicates()
	data['value'] = 1
	table = csr_matrix((data['value'], [data['name'].cat.codes, data['title'].cat.codes]))  # Very sparse, you know
	table @= table.T  # Compute co-occurrence
	table.setdiag(2)  # You should connect to yourself
	# table = table.astype(bool).astype(int)  # If you don't care the number
	orderName: ndarray = np.asarray(table.sum(axis=0)).squeeze().argsort()[::-1][:k]  # Inverse order, take top k, this is also the index of names
	table: csr_matrix = table[orderName, :][:, orderName]  # Extract
	order: ndarray = np.asarray(table.sum(axis=0)).squeeze().argsort()[::-1]  # After extraction, the order changes
	table: csr_matrix = table[order, :][:, order]  # Reorder
	result = pd.DataFrame(table.todense(), columns=data['name'].cat.categories[orderName])
	result.to_csv('PreprocessedData.csv', index=False)
	return result

def ComputeCluster(data: ndarray, numCluster: int) -> None:
	link: ndarray = linkage(squareform(1 / (data + 1), checks=False), method='ward')[:, :2].astype(int)
	union = [[i] for i in range(data.shape[0])]
	for i in range(data.shape[0] - numCluster):
		union.append(union[link[i, 0]] + union[link[i, 1]])
		union[link[i, 0]] = []
		union[link[i, 1]] = []
	cluster: ndarray = -np.ones(data.shape[0], int)
	union = list(filter(lambda a: a, union))
	for i in range(numCluster):
		cluster[union[i]] = i
	np.savetxt('Cluster.csv', cluster, '%d', delimiter=',', header='cluster')

if __name__ == '__main__':
	ComputeCluster(ComputeCooccurrence(100).values, 10)

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getAllRepos } from '../../api/repo';
import { Music, Clock, Globe, Lock } from 'lucide-react';



const RepoList = () => {
  const [repos, setRepos] = useState([]);

  const fetchRepos = async () => {
    try {
      const repos = await getAllRepos();
      setRepos(repos.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  return (
    <Container>
      <Header>Music Production Repositories</Header>
      <Grid>
        {repos.map((repo) => (
          <Card key={repo.repoId}>
            <StatusBadge isPublic={repo.public}>
              {repo.public ? (
                <>
                  <Globe size={14} />
                  Public
                </>
              ) : (
                <>
                  <Lock size={14} />
                  Private
                </>
              )}
            </StatusBadge>
            
            <RepoName to={`/repo/${repo.RepoID}`}>
              {repo.Name}
            </RepoName>

            <MetaInfo>
              <Clock size={16} />
              {new Date(repo.UpdatedAt * 1000).toLocaleString()}
            </MetaInfo>

            <MetaInfo>
              <Music size={16} />
              {repo.Description.BPM} BPM
            </MetaInfo>

            <TagContainer>
              <Tag>{repo.Description.Scale}</Tag>
              <Tag>{repo.Description.Genre}</Tag>
            </TagContainer>
          </Card>
        ))}
      </Grid>
    </Container>
  );
};

export default RepoList;

const Container = styled.div`
  max-width-5xl mx-auto p-6
`;

const Header = styled.h1`
  text-4xl font-bold mb-8 text-gray-800
`;

const Grid = styled.div`
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
`;

const Card = styled.div`
  bg-white rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-100
`;

const RepoName = styled(Link)`
  text-xl font-semibold text-blue-600 hover:text-blue-800 mb-4 block
`;

const TagContainer = styled.div`
  flex flex-wrap gap-2 mt-4
`;

const Tag = styled.span`
  px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700
`;

const MetaInfo = styled.div`
  flex items-center gap-2 text-gray-600 mt-2
`;

const StatusBadge = styled.span`
  flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
  ${props => props.isPublic ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
`;
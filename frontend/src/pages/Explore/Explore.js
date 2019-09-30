import React, { useState, Fragment } from "react";
import styled from "styled-components";
import { generatePath } from "react-router-dom";
import { Query } from "react-apollo";

import { Container } from "components/Layout";
import ExploreCard from "./ExploreCard";
import Skeleton from "components/Skeleton";
import PostPopup from "components/PostPopup";
import Modal from "components/Modal";
import InfiniteScroll from "components/InfiniteScroll";
import Empty from "components/Empty";
import { Loading } from "components/Loading";
import Head from "components/Head";

import { GET_POSTS } from "graphql/post";

import { EXPLORE_PAGE_POSTS_LIMIT } from "constants/DataLimit";

import { useStore } from "store";

import * as Routes from "routes";

const Root = styled(Container)`
  margin-top: ${p => p.theme.spacing.lg};
  margin-bottom: ${p => p.theme.spacing.sm};
`;

const PostsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 3fr));
  grid-auto-rows: auto;
  grid-gap: 10px;
`;

/**
 * Explore page
 */
const Explore = () => {
  const [{ auth }] = useStore();

  const [modalPostId, setModalPostId] = useState(null);

  const closeModal = () => {
    window.history.pushState("", "", "/explore");
    setModalPostId(null);
  };

  const openModal = postId => {
    window.history.pushState("", "", generatePath(Routes.POST, { id: postId }));
    setModalPostId(postId);
  };

  const variables = { authUserId: auth.user.id, skip: 0, limit: EXPLORE_PAGE_POSTS_LIMIT };

  return (
    <Root maxWidth="md">
      <Head title="Explore New Posts and Users" />

      <Query query={GET_POSTS} variables={variables} notifyOnNetworkStatusChange>
        {({ data, loading, fetchMore, networkStatus }) => {
          if (loading && networkStatus === 1) {
            return (
              <PostsContainer>
                <Skeleton height={200} count={9} />
              </PostsContainer>
            );
          }

          const { posts, count } = data.getPosts;

          if (!posts.length > 0) return <Empty text="No posts yet." />;

          return (
            <InfiniteScroll
              data={posts}
              dataKey="getPosts.posts"
              count={parseInt(count)}
              variables={variables}
              fetchMore={fetchMore}
            >
              {data => {
                const showNextLoading = loading && networkStatus === 3 && count !== data.length;

                return (
                  <Fragment>
                    <PostsContainer>
                      {data.map(post => (
                        <Fragment key={post.id}>
                          <Modal open={modalPostId === post.id} onClose={closeModal}>
                            <PostPopup id={post.id} closeModal={closeModal} />
                          </Modal>

                          <ExploreCard
                            image={post.image}
                            countLikes={post.likes.length}
                            countComments={post.comments.length}
                            openPostPopup={() => openModal(post.id)}
                          />
                        </Fragment>
                      ))}
                    </PostsContainer>

                    {showNextLoading && <Loading top="lg" />}
                  </Fragment>
                );
              }}
            </InfiniteScroll>
          );
        }}
      </Query>
    </Root>
  );
};

export default Explore;
